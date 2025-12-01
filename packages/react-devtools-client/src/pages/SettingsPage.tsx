import { getRpcClient } from '@react-devtools/kit'
import { Button, Checkbox, PRESET_COLORS, Select, useTheme } from '@react-devtools/ui'
import { useEffect, useState } from 'react'

interface ServerRpcFunctions {
  toggleDragResize: (enabled: boolean) => void
}

export function SettingsPage() {
  const { theme, toggleMode, setPrimaryColor } = useTheme()
  const [dragResizeEnabled, setDragResizeEnabled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('react-devtools-drag-resize')
    if (stored) {
      const enabled = stored === 'true'
      setDragResizeEnabled(enabled)
      const rpc = getRpcClient<ServerRpcFunctions>()
      if (rpc?.toggleDragResize) {
        rpc.toggleDragResize(enabled)
      }
    }
  }, [])

  const handleToggleDragResize = (checked: boolean) => {
    setDragResizeEnabled(checked)
    localStorage.setItem('react-devtools-drag-resize', String(checked))
    const rpc = getRpcClient<ServerRpcFunctions>()
    if (rpc?.toggleDragResize) {
      rpc.toggleDragResize(checked)
    }
  }

  return (
    <div className="h-full w-full overflow-auto bg-base p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl text-gray-900 font-bold dark:text-gray-100">
          Settings
        </h1>

        {/* Appearance */}
        <div className="space-y-3">
          <h2 className="text-lg text-gray-900 font-medium dark:text-gray-100">
            Appearance
          </h2>
          <div className="border border-base rounded-lg bg-white p-4 dark:bg-[#121212]">
            <div className="space-y-4">
              {/* Theme Mode */}
              <div>
                <Button
                  onClick={toggleMode}
                  variant="ghost"
                  size="sm"
                  className="border border-base"
                  icon={theme.mode === 'dark'
                    ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                      )
                    : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                          <line x1="1" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="12" x2="23" y2="12" />
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                      )}
                >
                  {theme.mode === 'dark' ? 'Dark' : 'Light'}
                </Button>
              </div>

              {/* UI Scale */}
              <div>
                <div className="mb-2 text-sm text-gray-900 font-medium dark:text-gray-100">
                  UI Scale
                </div>
                <div className="w-32">
                  <Select
                    defaultValue="normal"
                    options={[
                      { label: 'Small', value: 'small' },
                      { label: 'Normal', value: 'normal' },
                      { label: 'Large', value: 'large' },
                    ]}
                    disabled
                    size="md"
                  />
                </div>
              </div>

              <div className="h-px w-full bg-gray-100 dark:bg-neutral-800" />

              <div className="flex flex-wrap gap-4">
                <Checkbox label="Expand Sidebar" disabled />
                <Checkbox label="Scrollable Sidebar" checked disabled />
              </div>
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div className="space-y-4">
          <h2 className="text-lg text-gray-900 font-medium dark:text-gray-100">
            Accent Color
          </h2>
          <div className="border border-base rounded-lg bg-white p-4 dark:bg-[#121212]">
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESET_COLORS).map(([name, color]) => (
                <button
                  key={name}
                  type="button"
                  className={`h-6 w-6 rounded-full transition-all ${theme.primaryColor === name ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setPrimaryColor(name)}
                  title={name}
                />
              ))}
              <div className="relative flex items-center justify-center overflow-hidden rounded-full from-red-500 via-green-500 to-blue-500 bg-gradient-to-br p-[2px]">
                <div className="relative h-5 w-5 flex items-center justify-center rounded-full bg-white dark:bg-gray-900">
                  <input
                    type="color"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    value={theme.colors.primary[500]}
                    onChange={e => setPrimaryColor(e.target.value)}
                    title="Custom Color"
                  />
                  <span className="i-carbon-color-palette text-xs text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-lg text-gray-900 font-medium dark:text-gray-100">
            Features
          </h2>
          <div className="border border-base rounded-lg bg-white p-4 dark:bg-[#121212]">
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label="Enable Drag Resize"
                checked={dragResizeEnabled}
                onChange={handleToggleDragResize}
              />
              <Checkbox
                label="Close DevTools when clicking outside"
                disabled
              />
              <Checkbox
                label="Always show the floating panel"
                checked
                disabled
              />
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          React DevTools v
          {import.meta.env.PACKAGE_VERSION || '0.0.1'}
        </div>
      </div>
    </div>
  )
}
