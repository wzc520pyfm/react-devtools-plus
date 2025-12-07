import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      common: {
        nav: {
          features: 'Features',
          integration: 'Integration',
          community: 'Community',
          docs: 'Docs',
        },
        github: {
          star: 'Star on GitHub',
          view: 'View on GitHub',
          contribute: 'Contribute a PR',
        },
        ctas: {
          installPlugin: 'Install the plugin',
          readGuide: 'Read the setup guide',
        },
      },
      hero: {
        badge: 'Open-source · MIT · Dev-only overlay',
        titleLead: 'Debug like',
        titleHighlight: 'your workflow depends on it.',
        subtitle:
          'React DevTools Plus is an open-source overlay and Vite plugin that mirrors your React Fiber tree, profiles renders, and keeps production builds untouched.',
        primaryCta: 'Start Debugging',
        snippet: 'pnpm add -D react-devtools-plus',
      },
      valueProps: {
        badge: 'What we stand for',
        title: 'Trustable tooling for the fastest React teams.',
        subtitle: 'No vanity metrics—only the guarantees that speed up DX.',
        items: [
          {
            title: 'Dev-only overlay',
            description: 'Stays out of production bundles. Zero telemetry, zero surprises.',
          },
          {
            title: 'Lightning setup',
            description: 'pnpm add -D react-devtools-plus, add ReactDevTools() in vite.config.ts.',
          },
          {
            title: 'Keyboard-native',
            description: 'Option/Alt + Shift + R toggles instantly—no browser extension needed.',
          },
          {
            title: 'Open roadmap',
            description: 'MIT, community-driven priorities. PRs and issues shape the tool.',
          },
        ],
      },
      features: {
        badge: 'Core Capabilities',
        title: 'Built for React engineers who ship fast.',
        subtitle: 'From Fiber mirroring to keyboard toggles, designed for DX.',
        items: {
          dropIn: {
            title: 'Drop-in Vite Plugin',
            description:
              'Add the plugin and get an always-fresh overlay at /__react_devtools__/ with zero extra config.',
          },
          fiber: {
            title: 'Fiber Mirror',
            description: 'Automatic instrumentation of React Fiber roots to mirror component trees in dev.',
          },
          keyboard: {
            title: 'Keyboard-first overlay',
            description: 'Toggle instantly with Option/Alt + Shift + R. No browser extension required.',
          },
          safe: {
            title: 'Safe by default',
            description: 'Dev-only. Production bundles stay untouched; no hidden telemetry or surprises.',
          },
        },
      },
      integration: {
        badge: 'Frictionless setup',
        title: 'Integrate once. See issues instantly.',
        subtitle:
          'DevTools+ is built for modern React stacks. Stream signals without slowing you down.',
        highlights: [
          'Dev-only overlay; production bundles are untouched',
          'Keyboard shortcut friendly, no browser extension',
          'Ship faster with render timelines & component mirroring',
        ],
        steps: [
          {
            badge: 'Step 1',
            title: 'Install in minutes',
            description: 'pnpm add -D react-devtools-plus. Built for Vite and React 16-19.',
          },
          {
            badge: 'Step 2',
            title: 'Wire the plugin',
            description: 'Add ReactDevTools() to vite.config.ts. We instrument Fiber roots automatically.',
          },
          {
            badge: 'Step 3',
            title: 'See everything',
            description: 'Open /__react_devtools__/ or press Option/Alt + Shift + R to toggle the overlay.',
          },
        ],
        primaryCta: 'Install the plugin',
        secondaryCta: 'Read the setup guide',
      },
      testimonials: {
        title: 'Shape DevTools+ from day 0.',
        subtitle: 'We are early-stage and want founding adopters to set the roadmap with us.',
        actions: [
          {
            title: 'Star & watch',
            description: 'Signal demand and get notified on releases.',
          },
          {
            title: 'Open issues',
            description: 'Tell us your stack, pain points, and missing hooks.',
          },
          {
            title: 'Share repros',
            description: 'Small demos help us fix perf and overlay gaps fast.',
          },
          {
            title: 'Contribute',
            description: 'Docs, DX feedback, or PRs—anything helps.',
          },
        ],
        ctaPrimary: 'Star on GitHub',
        ctaSecondary: 'File an issue',
      },
      openSource: {
        badge: 'Open-source React DevTools Plus',
        title: 'Community-powered debugging that respects your production builds.',
        subtitle:
          'Add the plugin, profile your renders, and ship with confidence. DevTools Plus stays out of your production bundle while giving you the visibility you need in dev.',
        primary: 'Star on GitHub',
        secondary: 'Contribute a PR',
        pillars: [
          {
            title: 'MIT & transparent',
            description: 'We ship everything in the open—no dark patterns, no telemetry.',
          },
          {
            title: 'Built with the community',
            description: 'Issues, discussions, and PRs drive the roadmap. Your DX pain points set the priorities.',
          },
          {
            title: 'Optimized for shipping',
            description: 'Dev-only overlay: production bundles stay clean while you get deep insight locally.',
          },
        ],
      },
      docsCTA: {
        badge: 'In-depth guides · Recipes · API reference',
        title: 'Ship confidently with our Docs & Playgrounds',
        subtitle:
          'Learn the best practices for profiling and tracing renders. Copy-pasteable snippets get you productive in minutes—no CI required.',
        primary: 'Explore documentation',
        secondary: 'Open playground',
        snippets: {
          install: 'npm i react-devtools-plus',
          configTitle: 'devtools.config.ts',
          configMode: 'mode: \'analysis\'',
          configCapture: 'capture: [\'render\', \'network\', \'suspense\']',
          run: 'npm run dev',
          runDesc: 'Instant overlay · Hot reload · Session sharing',
        },
      },
      footer: {
        title: 'DevTools+',
        desc: 'The standard for modern React application debugging and performance monitoring.',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        copyright: 'React DevTools Plus',
      },
    },
  },
  zh: {
    translation: {
      common: {
        nav: {
          features: '特性',
          integration: '集成',
          community: '社区',
          docs: '文档',
        },
        github: {
          star: 'GitHub 加星',
          view: '查看 GitHub',
          contribute: '贡献 PR',
        },
        ctas: {
          installPlugin: '安装插件',
          readGuide: '查看配置指南',
        },
      },
      hero: {
        badge: '开源 · MIT · 仅开发环境覆盖层',
        titleLead: '像工作流依赖它一样调试',
        titleHighlight: '把效率拉满。',
        subtitle:
          'React DevTools Plus 是开源的覆盖层与 Vite 插件，镜像 React Fiber 树、分析渲染，并保持生产构建零侵入。',
        primaryCta: '开始调试',
        snippet: 'pnpm add -D react-devtools-plus',
      },
      valueProps: {
        badge: '我们的承诺',
        title: '为最快的 React 团队提供可信工具。',
        subtitle: '没有虚标数据，只有能加速 DX 的保障。',
        items: [
          {
            title: '仅开发环境',
            description: '完全不进生产包。零遥测，零意外。',
          },
          {
            title: '极速上手',
            description: 'pnpm add -D react-devtools-plus，并在 vite.config.ts 中添加 ReactDevTools()。',
          },
          {
            title: '键盘原生',
            description: 'Option/Alt + Shift + R 即刻唤起，无需浏览器扩展。',
          },
          {
            title: '公开路线图',
            description: 'MIT，社区驱动。你的 DX 痛点就是优先级。',
          },
        ],
      },
      features: {
        badge: '核心能力',
        title: '为快速迭代的 React 工程师打造。',
        subtitle: '从 Fiber 镜像到快捷键切换，一切围绕 DX。',
        items: {
          dropIn: {
            title: '即插即用 Vite 插件',
            description: '添加插件即可在 /__react_devtools__/ 获得实时覆盖层，无额外配置。',
          },
          fiber: {
            title: 'Fiber 镜像',
            description: '自动检测 React Fiber 根节点，在开发环境镜像组件树。',
          },
          keyboard: {
            title: '键盘优先覆盖层',
            description: 'Option/Alt + Shift + R 即刻切换，无需浏览器扩展。',
          },
          safe: {
            title: '默认安全',
            description: '仅作用于开发；生产包保持不变，没有隐藏遥测或意外。',
          },
        },
      },
      integration: {
        badge: '零阻力接入',
        title: '一次集成，立即看见问题。',
        subtitle:
          '为现代 React 技术栈打造。实时信号不拖慢你的构建。',
        highlights: [
          '仅开发覆盖层；生产构建零污染',
          '键盘快捷，无需浏览器扩展',
          '渲染时间线与组件镜像，加速发布',
        ],
        steps: [
          {
            badge: '步骤 1',
            title: '几分钟装好',
            description: 'pnpm add -D react-devtools-plus，支持 Vite 和 React 16-19。',
          },
          {
            badge: '步骤 2',
            title: '接上插件',
            description: '在 vite.config.ts 添加 ReactDevTools()，自动注入 Fiber 仪表。',
          },
          {
            badge: '步骤 3',
            title: '一目了然',
            description: '打开 /__react_devtools__/ 或按 Option/Alt + Shift + R 切换覆盖层。',
          },
        ],
        primaryCta: '安装插件',
        secondaryCta: '查看配置指南',
      },
      testimonials: {
        title: '从 0 开始共建 DevTools+',
        subtitle: '我们还在早期，期待“首批使用者”一起决定路线图。',
        actions: [
          {
            title: '加星 & 关注',
            description: '告诉我们需求，并第一时间收到发布通知。',
          },
          {
            title: '提交 Issue',
            description: '你的技术栈、痛点、缺失的钩子，都是优先级依据。',
          },
          {
            title: '分享复现',
            description: '小型复现能让性能与覆盖层问题更快修复。',
          },
          {
            title: '贡献共建',
            description: '文档、DX 反馈或 PR，任何形式都欢迎。',
          },
        ],
        ctaPrimary: 'GitHub 加星',
        ctaSecondary: '提交 Issue',
      },
      openSource: {
        badge: '开源 React DevTools Plus',
        title: '社区驱动的调试体验，尊重你的生产环境。',
        subtitle:
          '加上插件，分析渲染，放心发布。DevTools Plus 不侵入生产包，却让你在开发阶段看得更透。',
        primary: 'GitHub 加星',
        secondary: '贡献 PR',
        pillars: [
          {
            title: 'MIT 与透明',
            description: '完全开源，没有暗箱操作，没有遥测。',
          },
          {
            title: '与社区共建',
            description: '问题、讨论与 PR 决定路线。DX 痛点就是优先级。',
          },
          {
            title: '为交付优化',
            description: '仅开发覆盖层；生产包干净，同时获得深入洞察。',
          },
        ],
      },
      docsCTA: {
        badge: '深度指南 · 示例 · API',
        title: '用文档与演练场放心发布',
        subtitle:
          '学习性能剖析与渲染追踪的最佳实践。无需 CI 配置，复制片段即可几分钟上手。',
        primary: '查看文档',
        secondary: '打开演练场',
        snippets: {
          install: 'npm i react-devtools-plus',
          configTitle: 'devtools.config.ts',
          configMode: 'mode: \'analysis\'',
          configCapture: 'capture: [\'render\', \'network\', \'suspense\']',
          run: 'npm run dev',
          runDesc: '即时覆盖层 · 热更新 · 会话共享',
        },
      },
      footer: {
        title: 'DevTools+',
        desc: '现代 React 调试与性能监控的新标准。',
        privacy: '隐私政策',
        terms: '服务条款',
        copyright: 'React DevTools Plus',
      },
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
