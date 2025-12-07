# 编辑器配置指南

## 概述

React DevTools 支持在 Vite 和 Webpack 项目中自动打开编辑器并定位到源代码。当您点击 React DevTools 中的元素时，如果出现以下错误：

```
Could not open App.tsx in the editor.
The editor process exited with an error: spawn cursor ENOENT ('cursor' command does not exist in 'PATH').
```

或在浏览器控制台看到：

```
GET http://localhost:3004/__open-in-editor?file=... 404 (Not Found)
```

这表明需要进行编辑器配置。按照以下步骤解决：

## 方案一：安装 Cursor 命令行工具

1. 打开 Cursor 编辑器
2. 按下 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
3. 输入：`Shell Command: Install 'cursor' command in PATH`
4. 选择并执行该命令
5. **重启终端**
6. 验证安装：在终端运行 `cursor --version`

安装成功后，重新启动 dev 服务器：

```bash
# 在项目根目录
cd packages/playground/react
pnpm dev:cursor
```

## 方案二：使用 VS Code (推荐，如果已安装)

您的系统上已经安装了 VS Code 的命令行工具（`code`），可以直接使用：

```bash
# 使用 VS Code
cd packages/playground/react
pnpm dev
```

`pnpm dev` 命令已经配置为默认使用 VS Code (`EDITOR=code`)。

### 如果 VS Code 的 code 命令不可用

1. 打开 VS Code
2. 按下 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
3. 输入：`Shell Command: Install 'code' command in PATH`
4. 选择并执行该命令
5. **重启终端**
6. 验证安装：在终端运行 `code --version`

## 方案三：手动设置编辑器环境变量

如果您想使用其他编辑器，可以在启动 dev 服务器时指定：

```bash
# 使用 Cursor
EDITOR=cursor pnpm -C packages/playground/react dev

# 使用 VS Code
EDITOR=code pnpm -C packages/playground/react dev

# 使用 WebStorm
EDITOR=webstorm pnpm -C packages/playground/react dev

# 使用 Sublime Text
EDITOR=subl pnpm -C packages/playground/react dev

# 使用 Vim
EDITOR=vim pnpm -C packages/playground/react dev
```

## 验证配置

运行以下命令检查您的编辑器命令是否可用：

```bash
# 检查 Cursor
which cursor
cursor --version

# 检查 VS Code
which code
code --version

# 检查 WebStorm
which webstorm
```

## 支持情况

### ✅ Vite 项目

完全支持，自动集成。使用 Vite 内置的 `/__open-in-editor` 功能。

### ✅ Webpack 项目

已支持！React DevTools 会自动注册 `/__open-in-editor` 中间件。

**注意**: Webpack 支持依赖 `launch-editor` 包，已作为项目依赖自动安装。

## 配置选项

### 控制源码注入

您可以通过 `injectSource` 选项控制是否将源码位置注入到 HTML 属性中：

```typescript
// vite.config.ts 或 webpack.config.js
import ReactDevTools from 'react-devtools'

export default defineConfig({
  plugins: [
    ReactDevTools({
      // 禁用 HTML 属性注入（仅使用 Fiber._debugSource）
      injectSource: false
    })
  ]
})
```

**默认行为**：

- ✅ 开发模式下启用源码注入
- ❌ 生产构建时自动禁用
- 可通过 `injectSource` 选项显式控制

### 备用打开方案

如果服务器端点 `/__open-in-editor` 失败，插件会自动尝试使用 URL Protocol 作为备用方案：

- **主要方案**: `/__open-in-editor` 端点（推荐，需要编辑器 CLI）
- **备用方案**: `vscode://file/...` URL Protocol（无需 CLI）

配置备用编辑器（在浏览器控制台执行）：

```javascript
localStorage.setItem('react_devtools_editor', 'cursor')
// 支持: 'vscode', 'cursor', 'webstorm', 'sublime' 等
```

## 测试功能

### Vite 项目测试

1. 启动 dev 服务器：`pnpm dev` (在 packages/playground/react 目录)
2. 打开浏览器访问 `http://localhost:5173`
3. 按 `Alt/Option + Shift + D` 打开 React DevTools overlay
4. 点击 inspector 图标（眼睛图标）
5. 点击页面上的任意元素
6. 编辑器应该自动打开，并定位到对应的源代码位置

### Webpack 项目测试

1. 启动 dev 服务器：`pnpm dev` (在 packages/playground/react-webpack 目录)
2. 打开浏览器访问 `http://localhost:3004`
3. 按 `Alt/Option + Shift + D` 打开 React DevTools overlay
4. 点击 inspector 图标（眼睛图标）
5. 点击页面上的任意元素
6. 编辑器应该自动打开，并定位到对应的源代码位置

## 当前配置

查看 `packages/playground/react/package.json`：

```json
{
  "scripts": {
    "dev": "EDITOR=code vite",
    "dev:cursor": "EDITOR=cursor vite"
  }
}
```

- `pnpm dev` - 使用 VS Code
- `pnpm dev:cursor` - 使用 Cursor (需要先安装 CLI)

## 常见问题

### Q: 为什么需要重启终端？

A: 安装命令行工具后，需要重新加载 PATH 环境变量。重启终端或执行 `source ~/.zshrc` (Mac) / `source ~/.bashrc` (Linux)。

### Q: Cursor 命令安装后还是找不到？

A: 尝试手动检查 Cursor CLI 的安装位置：

```bash
# Mac
ls -la /usr/local/bin/cursor
# 或
ls -la ~/.cursor/bin/cursor
```

如果文件存在但不在 PATH 中，手动添加到 PATH：

```bash
# 编辑 ~/.zshrc 或 ~/.bashrc
export PATH="$PATH:/usr/local/bin"
# 或
export PATH="$PATH:$HOME/.cursor/bin"

# 重新加载配置
source ~/.zshrc
```

### Q: 我想同时支持多个编辑器怎么办？

A: 可以在 `package.json` 中添加多个脚本：

```json
{
  "scripts": {
    "dev": "EDITOR=code vite",
    "dev:cursor": "EDITOR=cursor vite",
    "dev:webstorm": "EDITOR=webstorm vite"
  }
}
```

### Q: 可以使用 GUI 方式打开而不是命令行吗？

A: 可以通过配置 `LAUNCH_EDITOR` 环境变量使用 URL scheme：

```bash
# Cursor
LAUNCH_EDITOR="cursor://file/{file}:{line}:{column}" pnpm dev

# VS Code
LAUNCH_EDITOR="vscode://file/{file}:{line}:{column}" pnpm dev
```

但通常使用命令行方式更稳定可靠。
