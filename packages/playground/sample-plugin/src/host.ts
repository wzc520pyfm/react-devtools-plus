/**
 * Sample Plugin Host Script
 * 示例插件宿主脚本
 *
 * 演示如何使用 defineHostPlugin 创建宿主脚本：
 * - RPC 方法供 View 层调用
 * - 向 View 层发送事件
 * - 访问宿主页面信息
 */

import type { SamplePluginOptions } from './index'
import { defineHostPlugin } from '@react-devtools-plus/api'

// 存储一些数据
let clickCount = 0
const logs: Array<{ time: number, message: string }> = []

export default defineHostPlugin({
  name: 'sample-plugin',

  rpc: {
    /**
     * 获取宿主页面信息
     */
    getHostInfo() {
      return {
        url: window.location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        timestamp: Date.now(),
      }
    },

    /**
     * 获取点击计数
     */
    getClickCount() {
      return clickCount
    },

    /**
     * 重置点击计数
     */
    resetClickCount() {
      clickCount = 0
      return clickCount
    },

    /**
     * 获取日志
     */
    getLogs() {
      return logs
    },

    /**
     * 清空日志
     */
    clearLogs() {
      logs.length = 0
      return true
    },

    /**
     * 在宿主页面执行 DOM 查询
     */
    queryElements(selector: string) {
      try {
        const elements = document.querySelectorAll(selector)
        return Array.from(elements).map((el, index) => ({
          index,
          tagName: el.tagName.toLowerCase(),
          id: el.id || undefined,
          className: el.className || undefined,
          textContent: el.textContent?.slice(0, 100),
        }))
      }
      catch (e) {
        return { error: String(e) }
      }
    },

    /**
     * 闪烁页面背景（演示 DOM 操作）
     */
    flashBackground() {
      // 使用闭包变量跟踪闪烁状态，防止重复触发
      const flashKey = '__devtools_flash_bg__'
      const win = window as any

      // 如果正在闪烁中，忽略此次调用
      if (win[flashKey]) {
        return false
      }

      // 标记正在闪烁，并保存真正的原始样式
      win[flashKey] = {
        flashing: true,
        originalStyle: document.body.style.backgroundColor,
      }

      document.body.style.backgroundColor = '#ffeb3b'

      setTimeout(() => {
        const state = win[flashKey]
        if (!state)
          return

        // 如果原本没有内联样式，则移除内联样式让 CSS 类生效
        // 如果原本有内联样式，则恢复原值
        if (state.originalStyle === '') {
          document.body.style.removeProperty('background-color')
        }
        else {
          document.body.style.backgroundColor = state.originalStyle
        }

        // 清除闪烁状态
        delete win[flashKey]
      }, 200)

      return true
    },
  },

  setup(ctx) {
    const options = ctx.getOptions<SamplePluginOptions>()

    // 添加日志
    const addLog = (message: string) => {
      const log = { time: Date.now(), message }
      logs.push(log)
      // 保持最多 50 条日志
      if (logs.length > 50) {
        logs.shift()
      }
      // 通知 View 层
      ctx.emit('log:add', log)
    }

    addLog('🚀 Host script initialized')

    if (options.showDebug) {
      addLog(`📋 Debug mode enabled`)
    }

    // 监听页面点击
    const handleClick = (e: MouseEvent) => {
      clickCount++
      const target = e.target as HTMLElement
      const tagName = target.tagName?.toLowerCase() || 'unknown'
      const id = target.id ? `#${target.id}` : ''
      // Use getAttribute('class') to handle SVG elements where className is SVGAnimatedString
      const classAttr = target.getAttribute?.('class')
      const className = classAttr ? `.${classAttr.split(' ')[0]}` : ''

      addLog(`🖱️ Click: <${tagName}${id}${className}> (total: ${clickCount})`)
      ctx.emit('click:count', clickCount)
    }

    document.addEventListener('click', handleClick)

    // 监听页面 URL 变化
    const handlePopState = () => {
      addLog(`🔗 Navigation: ${window.location.pathname}`)
      ctx.emit('navigation', { path: window.location.pathname })
    }

    window.addEventListener('popstate', handlePopState)

    // 定期发送心跳
    const heartbeatInterval = setInterval(() => {
      ctx.emit('heartbeat', { timestamp: Date.now() })
    }, 5000)

    console.log('[Sample Plugin] Host script loaded')

    // 返回清理函数
    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('popstate', handlePopState)
      clearInterval(heartbeatInterval)
      console.log('[Sample Plugin] Host script cleanup')
    }
  },
})
