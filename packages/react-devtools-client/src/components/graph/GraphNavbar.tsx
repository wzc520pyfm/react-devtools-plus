/**
 * GraphNavbar component - Search and filter controls for graph
 * 图表导航栏组件 - 搜索和过滤控制
 */

import type { GraphSettings } from '~/types/graph'
import { Checkbox, Input } from '@react-devtools-plus/ui'

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
        <Input
          size="sm"
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search modules..."
          allowClear
          onClear={() => onSearchChange('')}
          className="w-48"
        />
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
