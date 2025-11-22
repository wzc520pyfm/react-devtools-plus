# 编辑器配置指南

当您点击 React DevTools 中的元素时，如果出现以下错误：

```
Could not open App.tsx in the editor.
The editor process exited with an error: spawn cursor ENOENT ('cursor' command does not exist in 'PATH').
```

这表明系统找不到编辑器的命令行工具。按照以下步骤解决：

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

## 测试功能

1. 启动 dev 服务器：`pnpm dev` (在 packages/playground/react 目录)
2. 打开浏览器访问 `http://localhost:5173`
3. 按 `Alt/Option + Shift + R` 打开 React DevTools overlay
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
