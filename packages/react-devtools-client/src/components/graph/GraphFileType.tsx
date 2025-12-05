/**
 * GraphFileType component - Shows file type legend
 * 文件类型图例组件
 */

import { useFileTypes } from '~/composables/useGraph'

export function GraphFileType() {
  const { fileTypeData, fileTypeShow, toggleFileType } = useFileTypes()

  return (
    <div
      className={`
        absolute bottom-0 left-0 z-10 grid w-[260px] grid-cols-3 gap-2 rounded-tr-lg border border-l-0 border-base
        bg-white/80 px-4 py-2 text-sm backdrop-blur transition-transform duration-300
        dark:bg-neutral-900/80
        ${!fileTypeShow ? 'translate-x-[calc(-100%+30px)] translate-y-[calc(100%-30px)]' : ''}
        group
      `}
    >
      {/* Toggle button */}
      <div
        className={`
          absolute right-0 top-0 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-tr-lg
          bg-primary-500 text-white transition-opacity
          ${fileTypeShow ? 'rounded-bl-lg opacity-0 group-hover:opacity-100' : ''}
        `}
        onClick={() => toggleFileType()}
      >
        {fileTypeShow
          ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rotate-45 transition-transform hover:-translate-x-[10%] hover:translate-y-[10%]"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            )
          : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            )}
      </div>

      {/* Legend title */}
      <div className="col-span-3 mb-1 font-medium text-gray-600 dark:text-gray-400">
        Graph
      </div>

      {/* File type items */}
      {fileTypeData.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className={item.capitalize ? 'capitalize' : 'uppercase'}>
            {item.key}
          </span>
        </div>
      ))}
    </div>
  )
}

