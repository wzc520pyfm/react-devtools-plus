import { Badge, Button, Card, Input, PRESET_COLORS, useTheme } from '@react-devtools/ui'
import { useState } from 'react'

export function ThemeDemo() {
  const { theme, toggleMode, setPrimaryColor } = useTheme()
  const [inputValue, setInputValue] = useState('')

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>React DevTools UI - 主题系统测试</h1>

      {/* Theme Controls */}
      <Card title="🎨 主题控制" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Button variant="primary" onClick={toggleMode}>
            {theme.mode === 'dark' ? '☀️ 切换到浅色' : '🌙 切换到暗黑'}
          </Button>
          <Badge count={theme.mode === 'dark' ? 'Dark' : 'Light'} color="info">
            <Button>当前模式</Button>
          </Badge>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '24px' }}>选择主题色:</h4>
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
      <Card title="🔘 Button 组件" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="error">Error</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="text">Text</Button>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>尺寸:</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button size="sm" variant="primary">Small</Button>
          <Button size="md" variant="primary">Medium</Button>
          <Button size="lg" variant="primary">Large</Button>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>状态:</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" block>Block Button</Button>
        </div>
      </Card>

      {/* Input Component */}
      <Card title="📝 Input 组件" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            placeholder="默认输入框"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            allowClear
            onClear={() => setInputValue('')}
          />
          <Input placeholder="成功状态" status="success" />
          <Input placeholder="警告状态" status="warning" />
          <Input placeholder="错误状态" status="error" />
          <Input placeholder="禁用状态" disabled />
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>尺寸:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
          <Input size="lg" placeholder="Large" />
        </div>
      </Card>

      {/* Badge Component */}
      <Card title="🏷️ Badge 组件" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Badge count={5}>
            <Button>消息</Button>
          </Badge>
          <Badge count={100} max={99}>
            <Button>通知</Button>
          </Badge>
          <Badge dot color="success">
            <Button>在线</Button>
          </Badge>
          <Badge count="NEW" color="error">
            <Button>新功能</Button>
          </Badge>
        </div>

        <h4 style={{ marginBottom: '12px', marginTop: '16px' }}>独立徽章:</h4>
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
        <Card title="普通卡片" bordered>
          这是一个普通的卡片组件
        </Card>
        <Card title="可悬停卡片" bordered hoverable>
          鼠标悬停时有效果
        </Card>
        <Card bordered={false}>
          无边框卡片
        </Card>
      </div>

      {/* Color Palette Display */}
      <Card title="🎨 当前主题色板" style={{ marginTop: '24px' }}>
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
    </div>
  )
}
