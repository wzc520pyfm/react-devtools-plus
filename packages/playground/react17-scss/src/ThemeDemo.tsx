import { Badge, Button, Card, Input, PRESET_COLORS, useTheme } from '@react-devtools/ui'
import React, { useState } from 'react'

export function ThemeDemo() {
  const { theme, toggleMode, setPrimaryColor } = useTheme()
  const [inputValue, setInputValue] = useState('')

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>React DevTools UI - Theme System Test (React 17)</h1>

      {/* Theme Controls */}
      <Card title="🎨 Theme Controls" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Button variant="primary" onClick={toggleMode}>
            {theme.mode === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
          </Button>
          <Badge count={theme.mode === 'dark' ? 'Dark' : 'Light'} color="info">
            <Button>Current Mode</Button>
          </Badge>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '24px' }}>Select Primary Color:</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(PRESET_COLORS).map(([name, color]) => (
            <Button
              key={name}
              variant="ghost"
              size="sm"
              onClick={() => setPrimaryColor(name)}
              style={{
                borderColor: color,
                color,
              }}
            >
              {name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Button Variants */}
      <Card title="🔘 Button Component" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="error">Error</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="text">Text</Button>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>Sizes:</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button size="sm" variant="primary">Small</Button>
          <Button size="md" variant="primary">Medium</Button>
          <Button size="lg" variant="primary">Large</Button>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>States:</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" block>Block Button</Button>
        </div>
      </Card>

      {/* Input Component */}
      <Card title="📝 Input Component" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            placeholder="Default input"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            allowClear
            onClear={() => setInputValue('')}
          />
          <Input placeholder="Success status" status="success" />
          <Input placeholder="Warning status" status="warning" />
          <Input placeholder="Error status" status="error" />
          <Input placeholder="Disabled status" disabled />
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>Sizes:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
          <Input size="lg" placeholder="Large" />
        </div>
      </Card>

      {/* Badge Component */}
      <Card title="🏷️ Badge Component" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Badge count={5}>
            <Button>Messages</Button>
          </Badge>
          <Badge count={100} max={99}>
            <Button>Notifications</Button>
          </Badge>
          <Badge dot color="success">
            <Button>Online</Button>
          </Badge>
          <Badge count="NEW" color="error">
            <Button>New Feature</Button>
          </Badge>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>Standalone Badges:</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Badge count={5} color="primary" />
          <Badge count={10} color="success" />
          <Badge count={15} color="warning" />
          <Badge count={20} color="error" />
          <Badge count={25} color="info" />
        </div>
      </Card>

      {/* Card Variants */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <Card title="Regular Card" bordered>
          This is a regular card component
        </Card>
        <Card title="Hoverable Card" bordered hoverable>
          Hover effect enabled
        </Card>
        <Card bordered={false}>
          Borderless Card
        </Card>
      </div>

      {/* Color Palette Display */}
      <Card title="🎨 Current Theme Palette" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '8px' }}>
          {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map(shade => (
            <div key={shade} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '100%',
                  height: '60px',
                  backgroundColor: `var(--color-primary-${shade})`,
                  borderRadius: '4px',
                  border: '1px solid var(--color-border-base)',
                  marginBottom: '4px',
                }}
              />
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {shade}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SCSS Info */}
      <Card title="💅 SCSS Integration" style={{ marginTop: '24px' }}>
        <div className="demo-section">
          <p>This playground uses SCSS for styling:</p>
          <pre>
            <code>
              {`// SCSS Variables
$primary-color: #61dafb;
$secondary-color: #282c34;

// SCSS Mixins
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// SCSS Nesting
.card {
  &__title { ... }
  &__content { ... }
}`}
            </code>
          </pre>
        </div>
      </Card>
    </div>
  )
}
