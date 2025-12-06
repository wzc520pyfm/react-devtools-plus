/**
 * GraphNavbar component - Search and filter controls for graph
 * 图表导航栏组件 - 搜索和过滤控制
 */

import type { GraphSettings } from '~/types/graph'
import { Checkbox } from '@react-devtools-plus/ui'

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
    <div className="absolute left-0 top-0 z-10 w-full flex flex-nowrap items-center gap-4 border-b border-base bg-white/80 px-4 py-2 text-sm backdrop-blur dark:bg-neutral-900/80">
      {/* Search input */}
      <div className="relative flex-shrink-0">
        <input
          type="text"
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search modules..."
          className="h-8 w-48 border border-base rounded-md bg-white px-3 py-1 text-sm outline-none transition-colors focus:border-primary-500 dark:bg-neutral-800 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
        />
        {searchText && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 text-gray-400 -translate-y-1/2 hover:text-gray-600 dark:hover:text-gray-300"
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
        <div key={key} className="flex flex-shrink-0 items-center">
          <Checkbox
            checked={settings[key]}
            onChange={() => handleSettingChange(key)}
            label={`Show ${label ?? key}`}
          />
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-auto" />

      {/* Clear filter button */}
      {filterNodeId && (
        <button
          onClick={onClearFilter}
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 opacity-50 transition-opacity dark:bg-neutral-800 dark:text-gray-400 hover:opacity-100"
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
