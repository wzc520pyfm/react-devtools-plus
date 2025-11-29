import { Button, Card, PRESET_COLORS, Switch, useTheme } from '@react-devtools/ui'

export function SettingsPage() {
  const { theme, toggleMode, setPrimaryColor } = useTheme()

  return (
    <div className="h-full w-full overflow-auto bg-base p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl text-gray-900 font-bold dark:text-gray-100">
          Settings
        </h1>

        {/* Appearance */}
        <Card title="Appearance" className="bg-white dark:bg-[#121212]">
          <div className="space-y-6">
            {/* Theme Mode */}
            <div>
              <h3 className="mb-3 text-sm text-gray-900 font-medium dark:text-gray-100">
                Theme Mode
              </h3>
              <div className="flex items-center gap-4">
                <Button
                  variant={theme.mode === 'light' ? 'primary' : 'ghost'}
                  onClick={() => theme.mode !== 'light' && toggleMode()}
                >
                  <div className="flex items-center gap-2">
                    <span className="i-carbon-sun" />
                    Light
                  </div>
                </Button>
                <Button
                  variant={theme.mode === 'dark' ? 'primary' : 'ghost'}
                  onClick={() => theme.mode !== 'dark' && toggleMode()}
                >
                  <div className="flex items-center gap-2">
                    <span className="i-carbon-moon" />
                    Dark
                  </div>
                </Button>
                <Button
                  variant={theme.mode === 'auto' ? 'primary' : 'ghost'}
                  disabled // Auto mode might need more logic in useTheme to explicitly set 'auto'
                >
                  <div className="flex items-center gap-2">
                    <span className="i-carbon-laptop" />
                    Auto
                  </div>
                </Button>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <h3 className="mb-3 text-sm text-gray-900 font-medium dark:text-gray-100">
                Accent Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESET_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    type="button"
                    className={`h-8 w-8 border-2 rounded-full transition-all ${theme.primaryColor === name ? 'border-gray-400 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setPrimaryColor(name)}
                    title={name}
                  />
                ))}
                <div className="relative flex items-center justify-center overflow-hidden rounded-full from-red-500 via-green-500 to-blue-500 bg-gradient-to-br p-[2px]">
                  <div className="relative h-7 w-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-900">
                    <input
                      type="color"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      value={theme.colors.primary[500]}
                      onChange={e => setPrimaryColor(e.target.value)}
                      title="Custom Color"
                    />
                    <span className="i-carbon-color-palette text-lg text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* General */}
        <Card title="General" className="bg-white dark:bg-[#121212]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-medium dark:text-gray-100">Close on outside click</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Close DevTools when clicking outside the overlay</div>
              </div>
              <Switch checked={false} onChange={() => {}} disabled />
            </div>
          </div>
        </Card>

        <div className="text-center text-xs text-gray-400">
          React DevTools v
          {import.meta.env.PACKAGE_VERSION || '0.0.1'}
        </div>
      </div>
    </div>
  )
}
