import { execSync } from 'node:child_process'
import { defineConfig } from 'bumpp'
import fg from 'fast-glob'

export default defineConfig({
  files: fg.sync(['./packages/*/package.json'], {
    ignore: [
      // 不需要发布的包
      './packages/playground/*/package.json',
    ],
  }),
  // 自动 push commit 和 tag 到远程
  push: true,
  // commit时提交所有文件
  all: true,
  // tag 格式
  tag: true,
  // commit 消息格式
  commit: 'release: v%s',
  // 在提交commit前执行`pnpm build`
  execute: () => {
    execSync('pnpm build')
  },
})
