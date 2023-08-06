import 'server-only';
import AppShell from '@/app/app/shared/ui/AppShell';
import { findManyProjects } from '@/app/app/shared/project/project-model';
import TodayHeader from '@/app/app/shared/today/TodayHeader';
import AddTask from '@/app/app/shared/task/AddTask';
import { TaskListController } from '@/app/app/shared/task/TaskListController';
import { findTasksDueUntilToday } from '../shared/task/task-model';

export default async function TodayPage() {
  const [projects, tasks] = await Promise.all([findManyProjects(), findTasksDueUntilToday()]);

  return (
    <AppShell projects={projects}>
      <TodayHeader />
      <TaskListController tasks={tasks} />
      {projects && projects.length > 0 && tasks.length < 1 && (
        <p className="mb-16 text-sm font-medium text-gray-600">
          No tasks due today. Enjoy your day!
        </p>
      )}
      {projects && projects.length > 0 && (
        <AddTask defaultDueDate={new Date()} project={projects[0]} projects={projects} />
      )}
    </AppShell>
  );
}
