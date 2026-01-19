import type { LoadedPlugin } from '~/types/plugin'
import { Icon } from '@iconify/react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactLogo from '~/components/assets/ReactLogo'

function ComponentsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
    </svg>
  )
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M8 12h8" />
    </svg>
  )
}

function RoutesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  )
}

function ContextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  )
}

function GraphIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M10.3 10.3 7.5 7.5" />
      <path d="m13.7 10.3 2.8-2.8" />
      <path d="m7.5 16.5 2.8-2.8" />
      <path d="m13.7 13.7 2.8 2.8" />
    </svg>
  )
}

function TimelineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  )
}

function AssetsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function DefaultPluginIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M16 16v2" />
      <path d="M8 16v2" />
      <path d="M16 6v2" />
      <path d="M8 6v2" />
    </svg>
  )
}

/**
 * Get icon component from icon string
 * 从图标字符串获取图标组件
 *
 * Supports:
 * - Iconify format: 'ph:rocket-launch-fill', 'lucide:puzzle'
 * - SVG string: '<svg>...</svg>'
 */
function getIcon(iconStr?: string) {
  if (!iconStr) {
    return DefaultPluginIcon
  }

  // SVG string (backward compatibility)
  if (iconStr.startsWith('<svg')) {
    return ({ className }: { className?: string }) => (
      <div className={className} dangerouslySetInnerHTML={{ __html: iconStr }} />
    )
  }

  // Iconify format (e.g., 'ph:rocket-launch-fill', 'lucide:puzzle')
  // Iconify icons contain a colon separating the icon set and icon name
  if (iconStr.includes(':')) {
    return ({ className }: { className?: string }) => (
      <Icon icon={iconStr} className={className} width={24} height={24} />
    )
  }

  // Unknown format, use default
  return DefaultPluginIcon
}

function NavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const navigate = useNavigate()

  return (
    <div
      className={`group relative flex cursor-pointer items-center justify-center rounded-lg p-2 transition-colors ${isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}
      onClick={() => navigate(to)}
    >
      <Icon className="h-6 w-6" />
      {/* Tooltip using fixed positioning to escape overflow clipping */}
      {/* We use a simpler approach: render outside the flow but position manually if needed, or just rely on group-hover + fixed */}
      {/* Note: fixed positioning is relative to viewport, so left-14 works assuming sidebar is always on left edge */}
      <div className="fixed left-14 z-[100] hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:block group-hover:opacity-100">
        {label}
      </div>
    </div>
  )
}

export function Sidebar({ plugins = [] }: { plugins?: LoadedPlugin[] }) {
  return (
    <div className="z-50 h-full w-12 flex flex-col border-r border-base bg-base py-4">
      {/* Header (Overview) */}
      <div className="flex flex-shrink-0 flex-col items-center gap-2 pb-2">
        <NavItem to="/overview" icon={ReactLogo} label="Overview" />
      </div>

      {/* Scrollable Content */}
      <div className="scrollbar-none flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        <NavItem to="/components" icon={ComponentsIcon} label="Components" />
        <NavItem to="/routes" icon={RoutesIcon} label="Routes" />
        <NavItem to="/context" icon={ContextIcon} label="Context" />
        <NavItem to="/timeline" icon={TimelineIcon} label="Timeline" />
        <NavItem to="/assets" icon={AssetsIcon} label="Assets" />
        <NavItem to="/graph" icon={GraphIcon} label="Graph" />
        <NavItem to="/scan" icon={ScanIcon} label="React Scan" />
        {plugins.map(plugin => (
          <NavItem
            key={plugin.name}
            to={`/plugins/${plugin.name}`}
            icon={getIcon(plugin.icon)}
            label={plugin.title}
          />
        ))}
      </div>

      {/* Footer (Settings) */}
      <div className="flex flex-shrink-0 flex-col items-center gap-2 pt-2">
        <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
      </div>
    </div>
  )
}
