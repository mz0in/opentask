'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XIcon } from '@/modules/shared/icons/XIcon';
import { DeleteIcon } from '@/modules/shared/icons/DeleteIcon';
import { ConfirmationModalProps } from '@/modules/shared/modals/ConfirmationModal';
import { ErrorList } from '@/modules/shared/errors/ErrorList';
import { useFormAction } from '@/modules/app/shared/form/useFormAction';
import { ProjectDto } from '@/modules/app/projects/ProjectsRepository';
import { TaskForm } from './TaskForm';
import { deleteTask, TaskDto } from './TasksRepository';
import { Modal } from '@/modules/shared/modals/Modal';

export interface TaskModalModalProps {
  readonly isOpen: boolean;
  readonly onCloseModal?: () => void;
  readonly project: ProjectDto;
  readonly projects: Array<ProjectDto>;
  readonly shouldGoBackOnClose?: boolean;
  readonly shouldStartOnEditingMode?: boolean;
  readonly task?: TaskDto | null;
}

export const TaskModal = ({
  isOpen,
  onCloseModal,
  project,
  projects,
  shouldGoBackOnClose = true,
  shouldStartOnEditingMode = false,
  task,
}: TaskModalModalProps) => {
  const [confirmationModalProps, setConfirmationModalProps] =
    useState<ConfirmationModalProps | null>(null);
  const closeButtonRef = useRef(null);
  const router = useRouter();
  const [_isOpen, _setIsOpen] = useState(false);

  /*
   * Flavio Silva on Aug. 16th, 2023:
   * This is necessary to have the on enter <Transition> animation.
   * When I tried to set "show={true}" and "appear={true}" it didn't work.
   */
  useEffect(() => _setIsOpen(isOpen), [isOpen]);
  /**/

  const onFormSubmitted = () => {
    setConfirmationModalProps(null);
    onInternalCloseModal();
  };

  const [serverResponse, formAction] = useFormAction({
    action: deleteTask,
    onFormSubmitted,
  });

  const onInternalCloseModal = () => {
    if (confirmationModalProps) return;
    /*
     * Flavio Silva on Aug 4, 2023:
     * There's an issue calling router.back() after calling router.refresh().
     * Steps to reproduce:
     * 1) Reload the app at "/app/projects/[projectId]".
     * 2) Click on any task.
     * The URL is updated to "/app/tasks/[taskId]" and <TaskModal> is rendered
     * as expected.
     * 3) If you close the modal it works as expected, i.e., the URL changes back to
     * "/app/projects/[projectId]" and <TaskModal> is closed.
     * But if you click on the task name, change it, click "Save" (which calls router.refresh()
     * after data is saved), and then close the modal (which calls router.back()), the URL will be updated to
     * "/app/projects/[projectId]" as expected, but <TaskModal> is not closed.
     *
     * That probably means that we're still in the "/app/tasks/[taskId]" route.
     * The "/app/tasks/[taskId]" route is implemented as described in Next.js App Router docs, especifically
     * in the Parallel Routes and Intercepting Routes pages:
     *
     * https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
     * https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes
     *
     * Fix: Call router.refresh() after router.back().
     * That's far from ideal beacuse that causes a full refetch and rerender every time the modal is closed.
     * But it's the only way to fix the issue, at least while keeping everything as simple as possible
     * and following this new server / client paradigm, i.e., implementing data fetching on the server only, etc.
     *
     * But, calling router.refresh() here is also fixing another issue, which I don't think is a Next.js bug,
     * but rather an application issue: data is not refetched and so not rerendered after we make changes
     * to tasks in the <TaskModal>. And calling router.refresh() right after making changes to tasks,
     * from within "/app/tasks/[taskId]" route doesn't rereftch and rerender the routes
     * under it, i.e., it doesn't update data and UI that's outside the modal.
     */

    /*
     * setTimout() used to wait for the leave transition.
     */
    setTimeout(() => {
      if (onCloseModal) onCloseModal();
      if (shouldGoBackOnClose) router.back();
      router.refresh();
    }, 200);
    /**/

    _setIsOpen(false);
  };

  const onCloseConfirmationModal = () => {
    setConfirmationModalProps(null);
  };

  const onDeleteTask = () => {
    if (!task) throw new Error('Unexpected error trying to delete task.');

    setConfirmationModalProps({
      confirmButtonLabel: 'Delete',
      confirmButtonLabelSubmitting: 'Delete...',
      modalCopy: (
        <span>
          Are you sure you want to delete <span className="font-semibold">{task.name}</span>?
        </span>
      ),
      modalTitle: 'Delete Task',
      onCancelHandler: onCloseConfirmationModal,
      onConfirmHandler: 'submit',
      renderBodyWrapper: (children: React.ReactNode) => (
        <form action={formAction}>
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="isArchived" value="on" />
          {children}
          {serverResponse && serverResponse.errors && <ErrorList errors={serverResponse.errors} />}
        </form>
      ),
      show: true,
    });
  };

  return (
    <Modal
      appear={_isOpen}
      initialFocus={closeButtonRef}
      onClose={onInternalCloseModal}
      show={_isOpen}
    >
      <div className="flex items-start justify-between">
        <TaskForm
          project={project}
          projects={projects}
          shouldStartOnEditingMode={shouldStartOnEditingMode}
          task={task}
          taskNameClassName="text-2xl"
        />
        <div className="flex">
          {task && (
            <button
              type="button"
              className="rounded-md p-1.5 text-gray-700 hover:bg-gray-200"
              onClick={onDeleteTask}
            >
              <span className="sr-only">Delete task</span>
              <DeleteIcon aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="rounded-md ml-2 p-1.5 text-gray-700 hover:bg-gray-200"
            onClick={onInternalCloseModal}
            ref={closeButtonRef}
          >
            <span className="sr-only">Close modal</span>
            <XIcon aria-hidden="true" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
