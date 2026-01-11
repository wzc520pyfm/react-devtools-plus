# Qiankun Micro Frontend Playground

这是一个基于 qiankun + @umijs/max 的微前端示例，展示如何在微前端架构中正确使用 React DevTools Plus。

## 项目结构

```
qiankun-main/     # 主应用 (Port 8000)
qiankun-sub/      # 子应用 (Port 8001)
```

## 快速开始

### 1. 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 2. 启动应用

**方式一：同时启动主应用和子应用（推荐）**

在两个终端中分别运行：

```bash
# 终端 1：启动主应用 (Port 8000)
cd packages/playground/qiankun-main
pnpm dev

# 终端 2：启动子应用 (Port 8001)
cd packages/playground/qiankun-sub
pnpm dev
```

**方式二：只启动子应用（独立开发模式）**

```bash
cd packages/playground/qiankun-sub
pnpm dev:standalone
```

### 3. 访问应用

- 主应用：http://localhost:8000
- 子应用（独立）：http://localhost:8001
- 子应用（嵌入主应用）：http://localhost:8000/sub

## DevTools 配置说明

### 主应用配置

```typescript
// qiankun-main/plugin.ts
createUmiPlugin({
  microFrontend: 'host',      // 主应用模式，总是初始化 DevTools
  theme: { primaryColor: 'blue' }
})
```

### 子应用配置

```typescript
// qiankun-sub/plugin.ts
const isStandalone = process.env.STANDALONE === 'true'

createUmiPlugin({
  // 根据环境动态选择模式
  microFrontend: isStandalone ? 'standalone' : 'child',
  theme: { primaryColor: 'green' }
})
```

## 预期行为

| 场景                     | 主应用 DevTools | 子应用 DevTools         |
| ------------------------ | --------------- | ----------------------- |
| 只启动主应用             | ✅ 初始化       | -                       |
| 只启动子应用（独立模式） | -               | ✅ 初始化               |
| 主应用 + 嵌入子应用      | ✅ 初始化       | ⏭️ 跳过（检测到已存在） |

## 测试要点

1. **单一 DevTools**：在主应用中打开子应用时，应该只有一个 DevTools 面板
2. **组件检测**：DevTools 应该能同时检测主应用和子应用的组件
3. **独立开发**：使用 `pnpm dev:standalone` 启动子应用时，子应用应有独立的 DevTools

## 相关文档

- [微前端集成指南](../../MICRO_FRONTEND.md)
- [qiankun 官方文档](https://qiankun.umijs.org/)
