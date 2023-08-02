import { sanitize } from 'isomorphic-dompurify';

interface TaskListItemProps {
  readonly description: string;
  readonly name: string;
  readonly onTaskClick: () => void;
}

export default function TaskListItem({ description, name, onTaskClick }: TaskListItemProps) {
  if (name === 'Task 9') {
    console.log('TaskListItem() - description: ', description);
    console.log('TaskListItem() - sanitize(description): ', sanitize(description));
  }
  return (
    <button type="button" className="cursor flex text-left" onClick={onTaskClick}>
      <div className="mt-0.25 h-5 w-5 shrink-0 rounded-full border border-gray-500"></div>
      <div className="ml-3 block">
        <p className="text-sm text-gray-800">{name}</p>
        <div
          className="mt-1 block w-[20rem] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-400 md:w-[26rem] lg:w-[40rem]"
          dangerouslySetInnerHTML={{ __html: sanitize(description) }}
        />
      </div>
    </button>
  );
}
