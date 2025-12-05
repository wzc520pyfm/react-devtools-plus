/**
 * GraphNavbar component - Search and filter controls for graph
 * 图表导航栏组件 - 搜索和过滤控制
 */

import type { GraphSettings } from '~/types/graph'

interface GraphNavbarProps {
  searchText: string
  onSearchChange: (value: string) => void
  settings: GraphSettings
  onSettingsChange: (settings: GraphSettings) => void
  filterNodeId: string
  onClearFilter: () => void
}

const selectableItems: Array<[keyof GraphSettings, string?]> = [
  ['node_modules'],
  ['virtual', 'virtual module'],
  ['lib', 'library module'],
]

export function GraphNavbar({
  searchText,
  onSearchChange,
  settings,
  onSettingsChange,
  filterNodeId,
  onClearFilter,
}: GraphNavbarProps) {
  const handleSettingChange = (key: keyof GraphSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    })
  }

  return (
    <div className="absolute left-0 top-0 z-10 flex w-full flex-nowrap items-center gap-4 border-b border-base bg-white/80 px-4 py-2 text-sm backdrop-blur dark:bg-neutral-900/80">
      {/* Search input */}
      <div className="relative flex-shrink-0">
        <input
          type="text"
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search modules..."
          className="h-8 w-48 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:placeholder:text-neutral-500"
        />
        {searchText && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter checkboxes */}
      {selectableItems.map(([key, label]) => (
        <label key={key} className="flex flex-shrink-0 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={() => handleSettingChange(key)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600"
          />
          <span className={settings[key] ? 'text-base' : 'text-gray-400 dark:text-gray-600'}>
            Show
            {' '}
            {label ?? key}
          </span>
        </label>
      ))}

      {/* Spacer */}
      <div className="flex-auto" />

      {/* Clear filter button */}
      {filterNodeId && (
        <button
          onClick={onClearFilter}
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 opacity-50 transition-opacity hover:opacity-100 dark:bg-neutral-800 dark:text-gray-400"
        >
          Clear filter
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

