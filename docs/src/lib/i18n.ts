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
        titleLead: 'React debugging',
        titleHighlight: 'made simple.',
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
            description: 'Option/Alt + Shift + D toggles instantly—no browser extension needed.',
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
            description: 'Toggle instantly with Option/Alt + Shift + D. No browser extension required.',
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
            description: 'Open /__react_devtools__/ or press Option/Alt + Shift + D to toggle the overlay.',
          },
        ],
        primaryCta: 'Install the plugin',
        secondaryCta: 'Read the setup guide',
      },
      testimonials: {
        title: 'Shape DevTools+ from day 0.',
        subtitle: 'We are early-stage and want founding adopters to set the roadmap with us.',
        card: {
          badge: 'Early Stage',
          title: 'Help us prioritize what matters for your stack.',
          description: 'Share your framework versions, routing setup, Suspense usage, or perf blockers. We\'ll tailor the roadmap around real-world needs—not vanity features.',
        },
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
      // Features Page
      featuresPage: {
        badge: 'Feature Overview',
        title: 'Powerful features for React debugging',
        subtitle: 'Everything you need to debug, profile, and optimize your React applications.',
        items: {
          componentTree: {
            title: 'Component Tree',
            description: 'Visualize your React component hierarchy in real-time. Navigate, search, and inspect components with ease.',
          },
          timeline: {
            title: 'Timeline',
            description: 'Record and analyze runtime events including user interactions, component events, and performance metrics.',
          },
          assets: {
            title: 'Assets Browser',
            description: 'Browse and inspect all static assets in your project. Preview images, videos, fonts, and more.',
          },
          openInEditor: {
            title: 'Open in Editor',
            description: 'Click any element to jump directly to its source code in your favorite editor.',
          },
          scan: {
            title: 'React Scan',
            description: 'Detect unnecessary re-renders and performance bottlenecks with visual highlighting.',
          },
          moduleGraph: {
            title: 'Module Graph',
            description: 'Visualize your project\'s module dependencies. Understand relationships between components and modules at a glance.',
          },
        },
        cta: {
          title: 'Ready to get started?',
          description: 'Install the plugin and start debugging in minutes.',
          primary: 'Get Started',
          secondary: 'Read Documentation',
        },
      },
      // Integration Page
      integrationPage: {
        badge: 'Easy Integration',
        title: 'Integrate in minutes',
        subtitle: 'Works with Vite and Webpack out of the box. Zero configuration required.',
        install: {
          title: 'Install the package',
        },
        vite: {
          title: 'Vite Configuration',
          description: 'Add the plugin to your Vite configuration for instant setup.',
          learnMore: 'Learn more about Vite setup',
        },
        webpack: {
          title: 'Webpack Configuration',
          description: 'Works with Webpack 4 and 5. Full feature parity with Vite.',
          learnMore: 'Learn more about Webpack setup',
        },
        config: {
          title: 'Configuration Options',
          description: 'Customize DevTools behavior with these options:',
          options: {
            title: 'Available Options',
            enabledEnvironments: 'Control which environments enable DevTools',
            injectSource: 'Enable source location injection for "Open in Editor"',
            appendTo: 'Specify where to append the overlay script',
            assetsFiles: 'Configure which file types show in Assets panel',
          },
          cta: 'View full configuration guide',
        },
      },
      // Community Page
      communityPage: {
        badge: 'Join the Community',
        title: 'Build DevTools+ with us',
        subtitle: 'We\'re open-source and community-driven. Every contribution matters.',
        resources: {
          star: {
            title: 'Star on GitHub',
            description: 'Show your support and stay updated with releases.',
          },
          issues: {
            title: 'Report Issues',
            description: 'Found a bug? Let us know and we\'ll fix it fast.',
          },
          pr: {
            title: 'Submit Pull Requests',
            description: 'Contribute code, docs, or examples to the project.',
          },
          docs: {
            title: 'Read the Docs',
            description: 'Learn how to use and contribute to DevTools+.',
          },
        },
        howTo: {
          title: 'How to Contribute',
          subtitle: 'Get started with contributing to React DevTools Plus.',
          steps: [
            {
              title: 'Fork the repository',
              description: 'Create your own copy of the repository on GitHub.',
            },
            {
              title: 'Set up locally',
              description: 'Clone your fork and install dependencies with pnpm.',
            },
            {
              title: 'Make your changes',
              description: 'Implement your feature or fix. Follow our coding guidelines.',
            },
            {
              title: 'Submit a PR',
              description: 'Open a pull request and describe your changes.',
            },
          ],
        },
        codeOfConduct: {
          title: 'Code of Conduct',
          description: 'We\'re committed to providing a welcoming and inclusive community.',
          items: [
            'Be respectful and constructive in discussions',
            'Help others learn and grow',
            'Report unacceptable behavior',
            'Follow project guidelines',
          ],
        },
        cta: {
          title: 'Ready to contribute?',
          description: 'Join our growing community of contributors.',
          star: 'Star on GitHub',
          fork: 'Fork Repository',
        },
      },
      // Documentation
      docs: {
        backToHome: 'Back to Home',
        common: {
          screenshotPlaceholder: 'Screenshot coming soon',
          option: 'Option',
          type: 'Type',
          default: 'Default',
          description: 'Description',
          value: 'Value',
          behavior: 'Behavior',
        },
        nav: {
          gettingStarted: 'Getting Started',
          introduction: 'Introduction',
          installation: 'Installation',
          quickStart: 'Quick Start',
          features: 'Features',
          componentTree: 'Component Tree',
          timeline: 'Timeline',
          assets: 'Assets',
          openInEditor: 'Open in Editor',
          scan: 'React Scan',
          moduleGraph: 'Module Graph',
          plugins: 'Plugin System',
          integration: 'Integration',
          viteSetup: 'Vite Setup',
          webpackSetup: 'Webpack Setup',
          configuration: 'Configuration',
          help: 'Help',
          contributing: 'Contributing',
          faq: 'FAQ',
          troubleshooting: 'Troubleshooting',
        },
        introduction: {
          title: 'Introduction',
          description: 'React DevTools Plus is an open-source overlay and build tool plugin that helps you debug and profile React applications with ease.',
          whatIs: {
            title: 'What is React DevTools Plus?',
            description: 'React DevTools Plus is a powerful debugging tool designed to enhance your React development experience. It provides real-time component tree visualization, performance profiling, and seamless editor integration—all without polluting your production builds.',
          },
          whyUse: {
            title: 'Why use React DevTools Plus?',
            description: 'React DevTools Plus offers several advantages for React developers:',
            benefits: [
              'Dev-only overlay that never touches production bundles',
              'Zero configuration required—just add the plugin',
              'Keyboard shortcuts: Alt+Shift+D (toggle), Alt+Shift+R (hide)',
              'Works with both Vite and Webpack',
              'Open source with MIT license',
            ],
          },
          coreFeatures: {
            title: 'Core Features',
            items: [
              {
                title: 'Component Tree',
                description: 'Visualize and navigate your React component hierarchy in real-time.',
              },
              {
                title: 'Timeline',
                description: 'Record and analyze runtime events and performance metrics.',
              },
              {
                title: 'Assets Browser',
                description: 'Browse and preview all static assets in your project.',
              },
              {
                title: 'Open in Editor',
                description: 'Click any element to jump to its source code.',
              },
            ],
          },
          getStarted: 'Get Started',
          exploreFeatures: 'Explore Features',
          playground: {
            title: 'Try Online',
            description: 'Explore our integration examples directly in StackBlitz. No installation needed—just open and start experimenting.',
            tryIt: 'Open',
            table: {
              integration: 'Integration',
              description: 'Description',
              tags: 'Stack',
              action: '',
            },
            items: [
              {
                name: 'React 18 + Vite',
                description: 'Standard React 18 setup with Vite bundler',
                url: 'https://stackblitz.com/edit/vitejs-vite-r4b8unpu',
                tags: ['React 18', 'Vite'],
              },
              {
                name: 'React 19 + Vite',
                description: 'Latest React 19 with new features',
                url: 'https://stackblitz.com/edit/vitejs-vite-xfyg6rau',
                tags: ['React 19', 'Vite'],
              },
              {
                name: 'React + Webpack',
                description: 'Classic Webpack 5 bundler setup',
                url: 'https://stackblitz.com/~/github.com/wzc520pyfm/react-devtools-plus-webpack-example',
                tags: ['React 18', 'Webpack 5'],
              },
              {
                name: 'Next.js',
                description: 'Full-stack React framework integration',
                url: 'https://stackblitz.com/edit/stackblitz-starters-rnqks2z7?file=next.config.cjs',
                tags: ['Next.js', 'React 18'],
              },
              {
                name: 'Umi',
                description: 'Enterprise React framework by Ant Group',
                url: 'https://stackblitz.com/~/github.com/wzc520pyfm/react-devtools-plus-umi-example',
                tags: ['Umi 4', 'React 18'],
              },
              {
                name: 'React 17 + Webpack 4',
                description: 'Legacy setup for older projects',
                url: '#',
                tags: ['React 17', 'Webpack 4'],
              },
            ],
          },
        },
        installation: {
          title: 'Installation',
          description: 'Install React DevTools Plus in your project with your favorite package manager.',
          prerequisites: {
            title: 'Prerequisites',
            or: 'or',
          },
          recommended: 'Recommended',
          install: {
            title: 'Install the Package',
            description: 'Choose your preferred package manager:',
          },
          nextSteps: {
            title: 'Next Steps',
            description: 'After installation, configure the plugin for your build tool:',
            vite: 'Vite Setup',
            webpack: 'Webpack Setup',
          },
        },
        quickStart: {
          title: 'Quick Start',
          description: 'Get up and running with React DevTools Plus in under 5 minutes.',
          step1: {
            title: 'Step 1: Install the Package',
          },
          step2: {
            title: 'Step 2: Configure Vite',
            description: 'Add the plugin to your Vite configuration:',
          },
          step3: {
            title: 'Step 3: Start the Dev Server',
          },
          step4: {
            title: 'Step 4: Open DevTools',
            description: 'Toggle the overlay using the keyboard shortcut:',
            hint: 'Option + Shift + D on macOS',
            alternative: 'Or navigate directly to the DevTools page:',
          },
          learnMore: {
            vite: 'Learn More About Vite',
            features: 'Explore Features',
          },
        },
        viteSetup: {
          title: 'Vite Setup',
          description: 'Configure React DevTools Plus for Vite projects.',
          basic: {
            title: 'Basic Configuration',
            description: 'Add the plugin to your Vite configuration:',
          },
          advanced: {
            title: 'Advanced Configuration',
            description: 'Customize the plugin behavior with options:',
          },
          env: {
            title: 'Environment Variables',
            description: 'Control DevTools via environment variables:',
          },
          tip: {
            title: 'Pro Tip',
            content: 'The plugin automatically detects development mode. You don\'t need to configure anything for most use cases.',
          },
          options: {
            title: 'Configuration Options',
            enabledEnvironments: 'Control which environments enable DevTools',
            injectSource: 'Enable source location injection for "Open in Editor"',
            appendTo: 'Specify where to append the overlay script',
            assetsFiles: 'Configure which file types show in Assets panel',
          },
          nextSteps: {
            webpack: 'Webpack Setup',
            config: 'Full Configuration',
          },
        },
        webpackSetup: {
          title: 'Webpack Setup',
          description: 'Configure React DevTools Plus for Webpack projects.',
          support: {
            title: 'Full Webpack Support',
            content: 'React DevTools Plus supports Webpack 4 and 5 with full feature parity to Vite.',
          },
          basic: {
            title: 'Basic Configuration',
            description: 'Add the plugin to your Webpack configuration:',
          },
          advanced: {
            title: 'Advanced Configuration',
            description: 'Customize the plugin behavior:',
          },
          esm: {
            title: 'ESM Support',
            description: 'For ESM projects, use dynamic import:',
          },
          features: {
            title: 'Supported Features',
            html: 'HTML injection for overlay script',
            devServer: 'Dev server middleware integration',
            env: 'Environment-based control',
            hmr: 'Hot Module Replacement support',
            codeSplit: 'Code splitting for overlay',
          },
          tip: {
            title: 'Note',
            content: 'Make sure you have html-webpack-plugin installed for automatic script injection.',
          },
          nextSteps: {
            config: 'Full Configuration',
            features: 'Explore Features',
          },
        },
        configuration: {
          title: 'Configuration',
          description: 'Complete reference for all React DevTools Plus configuration options.',
          interface: {
            title: 'Plugin Options Interface',
            description: 'The complete TypeScript interface for plugin options:',
          },
          options: {
            title: 'Option Details',
            enabledEnvironments: {
              description: 'Control which environments enable DevTools:',
              undefined: 'Default behavior: dev enabled, build disabled',
              true: 'Same as default behavior',
              false: 'Disabled in all environments',
              array: 'Enabled only in specified environments',
            },
            injectSource: {
              description: 'Enable source code location injection:',
              true: 'Inject data-source-path attributes into JSX elements',
              false: 'Disable injection, use Fiber._debugSource only',
            },
            appendTo: {
              description: 'Specify which files to append the overlay script to. If not provided, injects into index.html automatically.',
            },
          },
          priority: {
            title: 'Configuration Priority',
            description: 'When multiple configuration sources exist, they are applied in this order:',
          },
          editor: {
            title: 'Editor Configuration',
            description: 'Configure which editor opens when clicking "Open in Editor":',
            tip: {
              title: 'CLI Installation',
              content: 'Make sure your editor\'s CLI tool is installed. For Cursor: Cmd+Shift+P → "Install cursor command". For VS Code: Cmd+Shift+P → "Install code command".',
            },
          },
        },
        componentTree: {
          title: 'Component Tree',
          description: 'Visualize and navigate your React component hierarchy in real-time with the Component Tree feature.',
          features: {
            title: 'Features',
            items: [
              'Real-time component tree visualization',
              'Search and filter components by name',
              'View component props and state',
              'Highlight components on hover',
              'Navigate to component source code',
            ],
          },
          howTo: {
            title: 'How to Use',
            steps: [
              'Open DevTools with Alt+Shift+D',
              'Click the "Components" tab in the sidebar',
              'Browse the component tree or use search',
              'Click a component to view its details',
              'Click "Open in Editor" to jump to source',
            ],
          },
          props: {
            title: 'Props & State Inspection',
            description: 'When you select a component, you can view its props and state in the detail panel. Values are displayed in an expandable tree view.',
          },
          tip: {
            title: 'Pro Tip',
            content: 'Use the search bar to quickly find components by name. The tree will automatically expand to show matching results.',
          },
        },
        timeline: {
          title: 'Timeline',
          description: 'Record and analyze runtime events in your React application to understand user interactions and performance.',
          layers: {
            title: 'Event Layers',
            description: 'Timeline organizes events into four distinct layers:',
            layer: 'Layer',
            events: 'Events Recorded',
          },
          howTo: {
            title: 'How to Use',
            steps: [
              'Open DevTools and click the Timeline tab',
              'Click the record button to start recording',
              'Interact with your application',
              'Click record again to stop',
              'Browse events in the timeline view',
            ],
          },
          api: {
            title: 'Programmatic API',
            description: 'You can add custom events to the timeline using the API:',
          },
          performance: {
            title: 'Performance Note',
            content: 'Timeline recording can impact performance in large applications. Enable only when debugging and disable unused event layers.',
          },
        },
        assets: {
          title: 'Assets Browser',
          description: 'Browse and inspect all static assets in your project directly from DevTools.',
          supported: {
            title: 'Supported File Types',
            type: 'Type',
            extensions: 'Extensions',
          },
          features: {
            title: 'Features',
            browser: {
              title: 'File Browser',
              items: [
                'Grid and list view modes',
                'Search by file name',
                'Filter by file type',
                'Folder-based organization',
              ],
            },
            details: {
              title: 'Asset Details',
              items: [
                'Visual preview for images, videos, audio',
                'File path and public URL',
                'Image dimensions and aspect ratio',
                'File size and last modified date',
                'Copy path and download actions',
              ],
            },
          },
          howTo: {
            title: 'How to Use',
            steps: [
              'Open DevTools and click the Assets tab',
              'Browse files or use search to filter',
              'Click any asset to view details',
              'Use action buttons to copy path or download',
            ],
          },
          support: {
            title: 'Vite & Webpack Support',
            content: 'The Assets feature works with both Vite and Webpack, automatically detecting your project structure.',
          },
        },
        openInEditor: {
          title: 'Open in Editor',
          description: 'Click any element in your app to jump directly to its source code in your favorite editor.',
          howItWorks: {
            title: 'How It Works',
            description: 'The plugin uses a multi-step process to enable this feature:',
            steps: [
              'During build, Babel injects data-source-path attributes into JSX elements',
              'The inspector reads these attributes when you click elements',
              'A request is sent to the dev server to open the file',
              'Your configured editor opens at the exact line and column',
            ],
          },
          inspector: {
            title: 'Using the Inspector',
            description: 'To select an element and open its source:',
            steps: [
              'Open DevTools with Alt+Shift+D',
              'Click the inspector icon in the toolbar',
              'Click any element in your app',
              'The source file opens in your editor',
            ],
          },
          editorConfig: {
            title: 'Editor Configuration',
            description: 'Configure which editor to use:',
            env: {
              title: 'Environment Variables',
            },
            packageJson: {
              title: 'Package.json Scripts',
            },
            fallback: {
              title: 'Browser Fallback',
            },
          },
          support: {
            title: 'Supported Environments',
            environment: 'Environment',
            status: 'Status',
          },
          tip: {
            title: 'CLI Installation Required',
            content: 'Make sure your editor\'s CLI is installed in PATH. For Cursor or VS Code, use the Command Palette to install the shell command.',
          },
        },
        scan: {
          title: 'React Scan',
          description: 'Detect unnecessary re-renders and performance bottlenecks with visual highlighting directly in your application.',
          howItWorks: {
            title: 'How It Works',
            description: 'React Scan monitors your component renders and provides visual feedback:',
            steps: [
              'Components are instrumented during development',
              'Re-renders are detected in real-time',
              'Visual overlays highlight components that re-rendered',
              'Color intensity indicates render frequency',
            ],
          },
          features: {
            title: 'Key Features',
            items: [
              {
                title: 'Visual Highlighting',
                description: 'See exactly which components re-rendered with colored overlays',
              },
              {
                title: 'Render Counting',
                description: 'Track how many times each component has rendered',
              },
              {
                title: 'Performance Insights',
                description: 'Identify unnecessary re-renders and optimization opportunities',
              },
              {
                title: 'Real-time Updates',
                description: 'Watch renders happen as you interact with your app',
              },
            ],
          },
          howTo: {
            title: 'Using React Scan',
            steps: [
              'Open DevTools with Alt+Shift+D',
              'Navigate to the Scan panel',
              'Enable scanning to start monitoring',
              'Interact with your app to trigger renders',
              'Observe highlighted components',
            ],
          },
          tip: {
            title: 'Performance Tip',
            content: 'Look for components that re-render frequently without visible changes. These are good candidates for React.memo() or useMemo() optimization.',
          },
        },
        moduleGraph: {
          title: 'Module Graph',
          description: 'Visualize your project\'s module dependencies and understand the relationships between components and modules at a glance.',
          whatIs: {
            title: 'What is Module Graph?',
            description: 'Module Graph provides a visual representation of how your project\'s modules are connected. It shows import/export relationships, helping you understand code architecture and identify potential issues like circular dependencies.',
          },
          features: {
            title: 'Key Features',
            items: [
              {
                title: 'Dependency Visualization',
                description: 'See how modules depend on each other with an interactive graph',
              },
              {
                title: 'Circular Detection',
                description: 'Automatically detect and highlight circular dependencies',
              },
              {
                title: 'Module Details',
                description: 'Click on any module to see its imports and exports',
              },
              {
                title: 'Search & Filter',
                description: 'Quickly find specific modules in large projects',
              },
            ],
          },
          howTo: {
            title: 'Using Module Graph',
            steps: [
              'Open DevTools with Alt+Shift+D',
              'Navigate to the Graph panel',
              'The module graph loads automatically',
              'Click and drag to navigate the graph',
              'Click on nodes to see module details',
            ],
          },
          tip: {
            title: 'Architecture Tip',
            content: 'Use the module graph to identify tightly coupled modules. Consider refactoring if you see too many connections between unrelated parts of your codebase.',
          },
        },
        plugins: {
          title: 'Plugin System',
          description: 'Extend React DevTools Plus with custom plugins. Create powerful debugging tools with host scripts, RPC communication, and custom UI panels.',
          whatIs: {
            title: 'What is the Plugin System?',
            description: 'The plugin system allows you to create custom DevTools extensions. Plugins can intercept network requests, manipulate DOM, communicate between the host application and DevTools UI, and add new panels to the DevTools interface.',
          },
          features: {
            title: 'Key Features',
            items: [
              'Define custom DevTools panels with React components',
              'Run host scripts in the main application thread',
              'Bi-directional RPC communication between host and view',
              'Intercept and monitor network requests (fetch/XHR)',
              'Access React component tree and selected node',
              'Inject custom HTML, CSS, and JavaScript',
              'Full TypeScript support with type safety',
            ],
          },
          install: {
            title: 'Installation',
            description: 'Install the API package to start building plugins:',
          },
          definePlugin: {
            title: 'Define a Plugin',
            description: 'Use defineDevToolsPlugin to create a new plugin. Provide metadata, a view component, and optional configuration:',
          },
          usage: {
            title: 'Using Your Plugin',
            description: 'Register your plugin in the Vite or Webpack configuration:',
          },
          hostPlugin: {
            title: 'Host Scripts',
            description: 'Host scripts run in the main application thread. They can intercept network requests, manipulate DOM, and communicate with the DevTools UI via RPC and events:',
          },
          context: {
            title: 'Host Plugin Context',
            description: 'The setup function receives a context object with these methods:',
            emit: 'Send events to the View layer',
            getOptions: 'Get plugin configuration options',
            onFetch: 'Intercept fetch requests',
            onXHR: 'Intercept XHR requests',
            onResource: 'Monitor resource loading',
            getTree: 'Get the React component tree',
            highlightNode: 'Highlight a component in the page',
          },
          viewHooks: {
            title: 'View Layer Hooks',
            description: 'Use these React hooks in your plugin panel to communicate with the host script:',
          },
          inject: {
            title: 'Injection Positions',
            description: 'Control where scripts and HTML content are injected:',
            head: 'Inject at the end of <head>',
            headPrepend: 'Inject at the beginning of <head> (earliest execution)',
            body: 'Inject at the end of <body>',
            bodyPrepend: 'Inject at the beginning of <body>',
            idle: 'Inject using requestIdleCallback (delayed)',
          },
          fullExample: {
            title: 'Complete Plugin Example',
            description: 'Here\'s a complete example showing all the pieces together:',
          },
          tip: {
            title: 'Pro Tip',
            content: 'Check out the sample-plugin in the playground directory for a working example. It demonstrates network interception, RPC communication, and custom UI rendering.',
          },
        },
        contributing: {
          title: 'Contributing',
          description: 'We welcome contributions from everyone! Here\'s how you can help improve React DevTools Plus.',
          welcome: {
            title: 'Thank You for Contributing!',
            description: 'Whether it\'s code, documentation, or feedback—every contribution helps make DevTools+ better for everyone.',
          },
          ways: {
            title: 'Ways to Contribute',
            items: [
              'Report bugs and issues on GitHub',
              'Suggest new features and improvements',
              'Submit pull requests with bug fixes',
              'Improve documentation and examples',
              'Help other users in discussions',
              'Share the project with others',
            ],
          },
          setup: {
            title: 'Development Setup',
            clone: {
              title: '1. Fork and Clone',
            },
            install: {
              title: '2. Install and Build',
            },
          },
          pr: {
            title: 'Submitting a Pull Request',
            description: 'Follow these steps to submit your changes:',
          },
          guidelines: {
            title: 'Contribution Guidelines',
            items: [
              'Follow the existing code style',
              'Write clear commit messages',
              'Add tests for new features',
              'Update documentation as needed',
              'Keep PRs focused and small',
              'Be respectful in discussions',
            ],
          },
          cta: {
            fork: 'Fork on GitHub',
            issues: 'View Issues',
          },
        },
        faq: {
          title: 'Frequently Asked Questions',
          description: 'Quick answers to common questions about React DevTools Plus.',
          noAnswer: {
            title: 'Can\'t find your answer?',
            description: 'If your question isn\'t answered here,',
            link: 'open an issue on GitHub',
          },
          items: [
            {
              question: 'Does DevTools+ work in production?',
              answer: 'By default, no. DevTools+ is designed to be dev-only. The plugin automatically excludes itself from production builds. You can explicitly enable it in specific environments using the enabledEnvironments option.',
            },
            {
              question: 'Does it support React 19?',
              answer: 'Yes! React DevTools Plus supports React 16.8+, including React 17, 18, and 19.',
            },
            {
              question: 'Can I use it without Vite?',
              answer: 'Yes! We also support Webpack 4 and 5 with full feature parity. See the Webpack Setup guide for details.',
            },
            {
              question: 'Will it slow down my app?',
              answer: 'The overlay adds minimal overhead during development. In production, there\'s zero impact as the plugin is not included.',
            },
            {
              question: 'Can I use it with the official React DevTools extension?',
              answer: 'Yes, but we recommend using one at a time to avoid duplicate updates. They work on different principles and may show slightly different information.',
            },
            {
              question: 'Is there any telemetry?',
              answer: 'No. React DevTools Plus collects zero telemetry. Everything runs locally in your browser.',
            },
          ],
        },
        troubleshooting: {
          title: 'Troubleshooting',
          description: 'Solutions to common issues you might encounter.',
          pluginNotLoading: {
            title: 'Plugin Not Loading',
            description: 'If the DevTools overlay doesn\'t appear, try rebuilding the plugin:',
          },
          editorNotOpening: {
            title: 'Editor Not Opening',
            error: 'Error: "spawn cursor ENOENT" or "command not found"',
            cause: 'This means the editor CLI is not installed or not in your PATH.',
            solution: {
              title: 'Install CLI Tool',
            },
            fallback: {
              title: 'Alternative: Set Fallback Editor',
            },
          },
          overlayNotShowing: {
            title: 'Overlay Not Showing',
            description: 'If the overlay doesn\'t appear:',
            checks: [
              'Make sure you\'re in development mode',
              'Check that the plugin is properly configured',
              'Try pressing Alt+Shift+D to toggle',
              'Check browser console for errors',
              'Verify the plugin isn\'t disabled by environment',
            ],
          },
          conflictWithExtension: {
            title: 'Conflict with Browser Extension',
            description: 'If you have the official React DevTools browser extension installed, you may see duplicate updates. We recommend disabling one while using the other.',
          },
          sourceLocations: {
            title: 'Incorrect Source Locations',
            description: 'If "Open in Editor" opens the wrong location:',
            checks: [
              'Ensure source maps are enabled',
              'Check that data-source-path attributes exist in HTML',
              'Verify Babel isn\'t conflicting with the plugin',
              'Make sure ReactDevTools() is before other React plugins',
            ],
          },
          stillStuck: {
            title: 'Still Having Issues?',
            description: 'If you\'re still stuck,',
            link: 'open an issue on GitHub',
          },
        },
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
        titleLead: '让 React 调试',
        titleHighlight: '变得简单。',
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
            description: 'Option/Alt + Shift + D 即刻唤起，无需浏览器扩展。',
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
            description: 'Option/Alt + Shift + D 即刻切换，无需浏览器扩展。',
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
        subtitle: '为现代 React 技术栈打造。实时信号不拖慢你的构建。',
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
            description: '打开 /__react_devtools__/ 或按 Option/Alt + Shift + D 切换覆盖层。',
          },
        ],
        primaryCta: '安装插件',
        secondaryCta: '查看配置指南',
      },
      testimonials: {
        title: '从 0 开始共建 DevTools+',
        subtitle: '我们还在早期，期待"首批使用者"一起决定路线图。',
        card: {
          badge: '早期阶段',
          title: '帮助我们确定你最需要的功能优先级',
          description: '分享你的框架版本、路由配置、Suspense 使用情况或性能瓶颈。我们会根据真实需求来规划路线图——而不是做花哨的功能。',
        },
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
      // Features Page
      featuresPage: {
        badge: '功能概览',
        title: '强大的 React 调试功能',
        subtitle: '调试、分析和优化 React 应用所需的一切。',
        items: {
          componentTree: {
            title: '组件树',
            description: '实时可视化 React 组件层级。轻松导航、搜索和检查组件。',
          },
          timeline: {
            title: '时间线',
            description: '记录和分析运行时事件，包括用户交互、组件事件和性能指标。',
          },
          assets: {
            title: '资源浏览器',
            description: '浏览和检查项目中的所有静态资源。预览图片、视频、字体等。',
          },
          openInEditor: {
            title: '在编辑器中打开',
            description: '点击任意元素直接跳转到你喜欢的编辑器中的源代码。',
          },
          scan: {
            title: 'React 扫描',
            description: '通过可视化高亮检测不必要的重渲染和性能瓶颈。',
          },
          moduleGraph: {
            title: '模块关系图',
            description: '可视化项目的模块依赖关系。一目了然地理解组件和模块之间的关联。',
          },
        },
        cta: {
          title: '准备开始了吗？',
          description: '安装插件，几分钟内开始调试。',
          primary: '开始使用',
          secondary: '阅读文档',
        },
      },
      // Integration Page
      integrationPage: {
        badge: '轻松集成',
        title: '几分钟内完成集成',
        subtitle: '开箱即用支持 Vite 和 Webpack。零配置要求。',
        install: {
          title: '安装包',
        },
        vite: {
          title: 'Vite 配置',
          description: '将插件添加到 Vite 配置中即可即时设置。',
          learnMore: '了解更多 Vite 设置',
        },
        webpack: {
          title: 'Webpack 配置',
          description: '支持 Webpack 4 和 5。与 Vite 功能完全一致。',
          learnMore: '了解更多 Webpack 设置',
        },
        config: {
          title: '配置选项',
          description: '使用这些选项自定义 DevTools 行为：',
          options: {
            title: '可用选项',
            enabledEnvironments: '控制哪些环境启用 DevTools',
            injectSource: '启用源位置注入以支持"在编辑器中打开"',
            appendTo: '指定附加覆盖层脚本的位置',
            assetsFiles: '配置资源面板显示的文件类型',
          },
          cta: '查看完整配置指南',
        },
      },
      // Community Page
      communityPage: {
        badge: '加入社区',
        title: '与我们一起构建 DevTools+',
        subtitle: '我们是开源且社区驱动的。每一份贡献都很重要。',
        resources: {
          star: {
            title: '在 GitHub 加星',
            description: '表示支持并获取发布更新。',
          },
          issues: {
            title: '报告问题',
            description: '发现 bug？告诉我们，我们会尽快修复。',
          },
          pr: {
            title: '提交 Pull Request',
            description: '为项目贡献代码、文档或示例。',
          },
          docs: {
            title: '阅读文档',
            description: '了解如何使用和贡献 DevTools+。',
          },
        },
        howTo: {
          title: '如何贡献',
          subtitle: '开始为 React DevTools Plus 做贡献。',
          steps: [
            {
              title: 'Fork 仓库',
              description: '在 GitHub 上创建你自己的仓库副本。',
            },
            {
              title: '本地设置',
              description: '克隆你的 fork 并使用 pnpm 安装依赖。',
            },
            {
              title: '进行更改',
              description: '实现你的功能或修复。遵循我们的编码规范。',
            },
            {
              title: '提交 PR',
              description: '打开 pull request 并描述你的更改。',
            },
          ],
        },
        codeOfConduct: {
          title: '行为准则',
          description: '我们致力于提供一个友好和包容的社区。',
          items: [
            '在讨论中保持尊重和建设性',
            '帮助他人学习和成长',
            '举报不当行为',
            '遵循项目指南',
          ],
        },
        cta: {
          title: '准备好贡献了吗？',
          description: '加入我们不断壮大的贡献者社区。',
          star: '在 GitHub 加星',
          fork: 'Fork 仓库',
        },
      },
      // Documentation
      docs: {
        backToHome: '返回首页',
        common: {
          screenshotPlaceholder: '截图即将推出',
          option: '选项',
          type: '类型',
          default: '默认值',
          description: '描述',
          value: '值',
          behavior: '行为',
        },
        nav: {
          gettingStarted: '快速开始',
          introduction: '介绍',
          installation: '安装',
          quickStart: '快速上手',
          features: '功能',
          componentTree: '组件树',
          timeline: '时间线',
          assets: '资源',
          openInEditor: '在编辑器中打开',
          scan: 'React 扫描',
          moduleGraph: '模块关系图',
          plugins: '插件系统',
          integration: '集成',
          viteSetup: 'Vite 设置',
          webpackSetup: 'Webpack 设置',
          configuration: '配置',
          help: '帮助',
          contributing: '贡献',
          faq: '常见问题',
          troubleshooting: '故障排除',
        },
        introduction: {
          title: '介绍',
          description: 'React DevTools Plus 是一个开源的覆盖层和构建工具插件，帮助你轻松调试和分析 React 应用。',
          whatIs: {
            title: '什么是 React DevTools Plus？',
            description: 'React DevTools Plus 是一个强大的调试工具，旨在增强你的 React 开发体验。它提供实时组件树可视化、性能分析和无缝编辑器集成——所有这些都不会污染你的生产构建。',
          },
          whyUse: {
            title: '为什么使用 React DevTools Plus？',
            description: 'React DevTools Plus 为 React 开发者提供了多项优势：',
            benefits: [
              '仅开发环境的覆盖层，永不触及生产包',
              '零配置要求——只需添加插件',
              '键盘快捷键：Alt+Shift+D（切换），Alt+Shift+R（隐藏）',
              '同时支持 Vite 和 Webpack',
              'MIT 许可证开源',
            ],
          },
          coreFeatures: {
            title: '核心功能',
            items: [
              {
                title: '组件树',
                description: '实时可视化和导航 React 组件层级。',
              },
              {
                title: '时间线',
                description: '记录和分析运行时事件和性能指标。',
              },
              {
                title: '资源浏览器',
                description: '浏览和预览项目中的所有静态资源。',
              },
              {
                title: '在编辑器中打开',
                description: '点击任意元素跳转到其源代码。',
              },
            ],
          },
          getStarted: '开始使用',
          exploreFeatures: '探索功能',
          playground: {
            title: '在线试用',
            description: '在 StackBlitz 中直接体验我们的集成示例。无需安装——打开即可开始探索。',
            tryIt: '打开',
            table: {
              integration: '集成方式',
              description: '描述',
              tags: '技术栈',
              action: '',
            },
            items: [
              {
                name: 'React 18 + Vite',
                description: '使用 Vite 构建工具的标准 React 18 配置',
                url: 'https://stackblitz.com/edit/vitejs-vite-r4b8unpu',
                tags: ['React 18', 'Vite'],
              },
              {
                name: 'React 19 + Vite',
                description: '最新 React 19 及其新特性',
                url: 'https://stackblitz.com/edit/vitejs-vite-xfyg6rau',
                tags: ['React 19', 'Vite'],
              },
              {
                name: 'React + Webpack',
                description: '经典 Webpack 5 构建工具配置',
                url: 'https://stackblitz.com/~/github.com/wzc520pyfm/react-devtools-plus-webpack-example',
                tags: ['React 18', 'Webpack 5'],
              },
              {
                name: 'Next.js',
                description: '全栈 React 框架集成',
                url: 'https://stackblitz.com/edit/stackblitz-starters-rnqks2z7?file=next.config.cjs',
                tags: ['Next.js', 'React 18'],
              },
              {
                name: 'Umi',
                description: '蚂蚁集团企业级 React 框架',
                url: 'https://stackblitz.com/~/github.com/wzc520pyfm/react-devtools-plus-umi-example',
                tags: ['Umi 4', 'React 18'],
              },
              {
                name: 'React 17 + Webpack 4',
                description: '适用于旧项目的传统配置',
                url: '#',
                tags: ['React 17', 'Webpack 4'],
              },
            ],
          },
        },
        installation: {
          title: '安装',
          description: '使用你喜欢的包管理器在项目中安装 React DevTools Plus。',
          prerequisites: {
            title: '前提条件',
            or: '或',
          },
          recommended: '推荐',
          install: {
            title: '安装包',
            description: '选择你喜欢的包管理器：',
          },
          nextSteps: {
            title: '下一步',
            description: '安装后，为你的构建工具配置插件：',
            vite: 'Vite 设置',
            webpack: 'Webpack 设置',
          },
        },
        quickStart: {
          title: '快速开始',
          description: '在 5 分钟内启动并运行 React DevTools Plus。',
          step1: {
            title: '步骤 1：安装包',
          },
          step2: {
            title: '步骤 2：配置 Vite',
            description: '将插件添加到你的 Vite 配置中：',
          },
          step3: {
            title: '步骤 3：启动开发服务器',
          },
          step4: {
            title: '步骤 4：打开 DevTools',
            description: '使用键盘快捷键切换覆盖层：',
            hint: 'macOS 上为 Option + Shift + D',
            alternative: '或直接导航到 DevTools 页面：',
          },
          learnMore: {
            vite: '了解更多关于 Vite',
            features: '探索功能',
          },
        },
        viteSetup: {
          title: 'Vite 设置',
          description: '为 Vite 项目配置 React DevTools Plus。',
          basic: {
            title: '基本配置',
            description: '将插件添加到你的 Vite 配置中：',
          },
          advanced: {
            title: '高级配置',
            description: '使用选项自定义插件行为：',
          },
          env: {
            title: '环境变量',
            description: '通过环境变量控制 DevTools：',
          },
          tip: {
            title: '专业提示',
            content: '插件会自动检测开发模式。大多数情况下你不需要配置任何东西。',
          },
          options: {
            title: '配置选项',
            enabledEnvironments: '控制哪些环境启用 DevTools',
            injectSource: '启用源位置注入以支持"在编辑器中打开"',
            appendTo: '指定附加覆盖层脚本的位置',
            assetsFiles: '配置资源面板显示的文件类型',
          },
          nextSteps: {
            webpack: 'Webpack 设置',
            config: '完整配置',
          },
        },
        webpackSetup: {
          title: 'Webpack 设置',
          description: '为 Webpack 项目配置 React DevTools Plus。',
          support: {
            title: '完整 Webpack 支持',
            content: 'React DevTools Plus 支持 Webpack 4 和 5，功能与 Vite 完全一致。',
          },
          basic: {
            title: '基本配置',
            description: '将插件添加到你的 Webpack 配置中：',
          },
          advanced: {
            title: '高级配置',
            description: '自定义插件行为：',
          },
          esm: {
            title: 'ESM 支持',
            description: '对于 ESM 项目，使用动态导入：',
          },
          features: {
            title: '支持的功能',
            html: '覆盖层脚本的 HTML 注入',
            devServer: '开发服务器中间件集成',
            env: '基于环境的控制',
            hmr: '热模块替换支持',
            codeSplit: '覆盖层代码分割',
          },
          tip: {
            title: '注意',
            content: '确保你已安装 html-webpack-plugin 以实现自动脚本注入。',
          },
          nextSteps: {
            config: '完整配置',
            features: '探索功能',
          },
        },
        configuration: {
          title: '配置',
          description: 'React DevTools Plus 所有配置选项的完整参考。',
          interface: {
            title: '插件选项接口',
            description: '插件选项的完整 TypeScript 接口：',
          },
          options: {
            title: '选项详情',
            enabledEnvironments: {
              description: '控制哪些环境启用 DevTools：',
              undefined: '默认行为：开发启用，构建禁用',
              true: '与默认行为相同',
              false: '所有环境禁用',
              array: '仅在指定环境中启用',
            },
            injectSource: {
              description: '启用源代码位置注入：',
              true: '将 data-source-path 属性注入 JSX 元素',
              false: '禁用注入，仅使用 Fiber._debugSource',
            },
            appendTo: {
              description: '指定要附加覆盖层脚本的文件。如果不提供，会自动注入到 index.html。',
            },
          },
          priority: {
            title: '配置优先级',
            description: '当存在多个配置源时，按以下顺序应用：',
          },
          editor: {
            title: '编辑器配置',
            description: '配置点击"在编辑器中打开"时打开的编辑器：',
            tip: {
              title: 'CLI 安装',
              content: '确保你的编辑器 CLI 工具已安装。对于 Cursor：Cmd+Shift+P → "Install cursor command"。对于 VS Code：Cmd+Shift+P → "Install code command"。',
            },
          },
        },
        componentTree: {
          title: '组件树',
          description: '使用组件树功能实时可视化和导航 React 组件层级。',
          features: {
            title: '功能',
            items: [
              '实时组件树可视化',
              '按名称搜索和过滤组件',
              '查看组件 props 和 state',
              '悬停时高亮组件',
              '导航到组件源代码',
            ],
          },
          howTo: {
            title: '如何使用',
            steps: [
              '使用 Alt+Shift+D 打开 DevTools',
              '点击侧边栏中的"组件"标签',
              '浏览组件树或使用搜索',
              '点击组件查看其详情',
              '点击"在编辑器中打开"跳转到源代码',
            ],
          },
          props: {
            title: 'Props 和 State 检查',
            description: '当你选择一个组件时，你可以在详情面板中查看其 props 和 state。值以可展开的树形视图显示。',
          },
          tip: {
            title: '专业提示',
            content: '使用搜索栏按名称快速查找组件。树会自动展开以显示匹配的结果。',
          },
        },
        timeline: {
          title: '时间线',
          description: '记录和分析 React 应用中的运行时事件，以了解用户交互和性能。',
          layers: {
            title: '事件层',
            description: '时间线将事件组织为四个不同的层：',
            layer: '层',
            events: '记录的事件',
          },
          howTo: {
            title: '如何使用',
            steps: [
              '打开 DevTools 并点击时间线标签',
              '点击录制按钮开始录制',
              '与你的应用交互',
              '再次点击录制按钮停止',
              '在时间线视图中浏览事件',
            ],
          },
          api: {
            title: '编程 API',
            description: '你可以使用 API 向时间线添加自定义事件：',
          },
          performance: {
            title: '性能说明',
            content: '时间线录制可能会影响大型应用的性能。仅在调试时启用，并禁用未使用的事件层。',
          },
        },
        assets: {
          title: '资源浏览器',
          description: '直接从 DevTools 浏览和检查项目中的所有静态资源。',
          supported: {
            title: '支持的文件类型',
            type: '类型',
            extensions: '扩展名',
          },
          features: {
            title: '功能',
            browser: {
              title: '文件浏览器',
              items: [
                '网格和列表视图模式',
                '按文件名搜索',
                '按文件类型过滤',
                '基于文件夹的组织',
              ],
            },
            details: {
              title: '资源详情',
              items: [
                '图片、视频、音频的可视预览',
                '文件路径和公共 URL',
                '图片尺寸和宽高比',
                '文件大小和最后修改日期',
                '复制路径和下载操作',
              ],
            },
          },
          howTo: {
            title: '如何使用',
            steps: [
              '打开 DevTools 并点击资源标签',
              '浏览文件或使用搜索过滤',
              '点击任意资源查看详情',
              '使用操作按钮复制路径或下载',
            ],
          },
          support: {
            title: 'Vite 和 Webpack 支持',
            content: '资源功能同时支持 Vite 和 Webpack，自动检测你的项目结构。',
          },
        },
        openInEditor: {
          title: '在编辑器中打开',
          description: '点击应用中的任意元素，直接跳转到你喜欢的编辑器中的源代码。',
          howItWorks: {
            title: '工作原理',
            description: '插件使用多步骤过程来启用此功能：',
            steps: [
              '在构建期间，Babel 将 data-source-path 属性注入 JSX 元素',
              '当你点击元素时，检查器读取这些属性',
              '向开发服务器发送请求以打开文件',
              '你配置的编辑器在确切的行和列打开',
            ],
          },
          inspector: {
            title: '使用检查器',
            description: '选择元素并打开其源代码：',
            steps: [
              '使用 Alt+Shift+D 打开 DevTools',
              '点击工具栏中的检查器图标',
              '点击应用中的任意元素',
              '源文件在你的编辑器中打开',
            ],
          },
          editorConfig: {
            title: '编辑器配置',
            description: '配置要使用的编辑器：',
            env: {
              title: '环境变量',
            },
            packageJson: {
              title: 'Package.json 脚本',
            },
            fallback: {
              title: '浏览器回退',
            },
          },
          support: {
            title: '支持的环境',
            environment: '环境',
            status: '状态',
          },
          tip: {
            title: '需要 CLI 安装',
            content: '确保你的编辑器 CLI 已安装在 PATH 中。对于 Cursor 或 VS Code，使用命令面板安装 shell 命令。',
          },
        },
        scan: {
          title: 'React 扫描',
          description: '通过可视化高亮直接在应用中检测不必要的重渲染和性能瓶颈。',
          howItWorks: {
            title: '工作原理',
            description: 'React Scan 监控组件渲染并提供可视化反馈：',
            steps: [
              '组件在开发期间被监控',
              '实时检测重渲染',
              '可视化覆盖层高亮显示重渲染的组件',
              '颜色强度表示渲染频率',
            ],
          },
          features: {
            title: '核心功能',
            items: [
              {
                title: '可视化高亮',
                description: '通过彩色覆盖层准确查看哪些组件重渲染了',
              },
              {
                title: '渲染计数',
                description: '跟踪每个组件渲染了多少次',
              },
              {
                title: '性能洞察',
                description: '识别不必要的重渲染和优化机会',
              },
              {
                title: '实时更新',
                description: '在与应用交互时观察渲染发生',
              },
            ],
          },
          howTo: {
            title: '使用 React Scan',
            steps: [
              '使用 Alt+Shift+D 打开 DevTools',
              '导航到 Scan 面板',
              '启用扫描开始监控',
              '与应用交互触发渲染',
              '观察高亮显示的组件',
            ],
          },
          tip: {
            title: '性能提示',
            content: '寻找频繁重渲染但没有可见变化的组件。这些是 React.memo() 或 useMemo() 优化的好候选。',
          },
        },
        moduleGraph: {
          title: '模块关系图',
          description: '可视化项目的模块依赖关系，一目了然地理解组件和模块之间的关联。',
          whatIs: {
            title: '什么是模块关系图？',
            description: '模块关系图提供了项目模块之间连接的可视化表示。它展示了导入/导出关系，帮助你理解代码架构并识别潜在问题（如循环依赖）。',
          },
          features: {
            title: '核心功能',
            items: [
              {
                title: '依赖可视化',
                description: '通过交互式图形查看模块之间的依赖关系',
              },
              {
                title: '循环检测',
                description: '自动检测并高亮显示循环依赖',
              },
              {
                title: '模块详情',
                description: '点击任意模块查看其导入和导出',
              },
              {
                title: '搜索与过滤',
                description: '在大型项目中快速找到特定模块',
              },
            ],
          },
          howTo: {
            title: '使用模块关系图',
            steps: [
              '使用 Alt+Shift+D 打开 DevTools',
              '导航到 Graph 面板',
              '模块关系图自动加载',
              '点击并拖动以导航图形',
              '点击节点查看模块详情',
            ],
          },
          tip: {
            title: '架构提示',
            content: '使用模块关系图识别紧密耦合的模块。如果看到代码库中不相关部分之间存在过多连接，请考虑重构。',
          },
        },
        plugins: {
          title: '插件系统',
          description: '使用自定义插件扩展 React DevTools Plus。创建强大的调试工具，支持宿主脚本、RPC 通信和自定义 UI 面板。',
          whatIs: {
            title: '什么是插件系统？',
            description: '插件系统允许你创建自定义的 DevTools 扩展。插件可以拦截网络请求、操作 DOM、在宿主应用和 DevTools UI 之间通信，并向 DevTools 界面添加新面板。',
          },
          features: {
            title: '核心功能',
            items: [
              '使用 React 组件定义自定义 DevTools 面板',
              '在主应用线程中运行宿主脚本',
              '宿主与视图之间的双向 RPC 通信',
              '拦截和监控网络请求（fetch/XHR）',
              '访问 React 组件树和选中的节点',
              '注入自定义 HTML、CSS 和 JavaScript',
              '完整的 TypeScript 支持和类型安全',
            ],
          },
          install: {
            title: '安装',
            description: '安装 API 包以开始构建插件：',
          },
          definePlugin: {
            title: '定义插件',
            description: '使用 defineDevToolsPlugin 创建新插件。提供元数据、视图组件和可选配置：',
          },
          usage: {
            title: '使用你的插件',
            description: '在 Vite 或 Webpack 配置中注册你的插件：',
          },
          hostPlugin: {
            title: '宿主脚本',
            description: '宿主脚本运行在主应用线程中。它们可以拦截网络请求、操作 DOM，并通过 RPC 和事件与 DevTools UI 通信：',
          },
          context: {
            title: '宿主插件上下文',
            description: 'setup 函数接收一个包含以下方法的上下文对象：',
            emit: '向视图层发送事件',
            getOptions: '获取插件配置选项',
            onFetch: '拦截 fetch 请求',
            onXHR: '拦截 XHR 请求',
            onResource: '监控资源加载',
            getTree: '获取 React 组件树',
            highlightNode: '在页面中高亮显示组件',
          },
          viewHooks: {
            title: '视图层 Hooks',
            description: '在插件面板中使用这些 React hooks 与宿主脚本通信：',
          },
          inject: {
            title: '注入位置',
            description: '控制脚本和 HTML 内容的注入位置：',
            head: '在 <head> 末尾注入',
            headPrepend: '在 <head> 开头注入（最早执行）',
            body: '在 <body> 末尾注入',
            bodyPrepend: '在 <body> 开头注入',
            idle: '使用 requestIdleCallback 延迟注入',
          },
          fullExample: {
            title: '完整插件示例',
            description: '这是一个展示所有部分组合在一起的完整示例：',
          },
          tip: {
            title: '专业提示',
            content: '查看 playground 目录中的 sample-plugin 获取可运行的示例。它演示了网络拦截、RPC 通信和自定义 UI 渲染。',
          },
        },
        contributing: {
          title: '贡献',
          description: '我们欢迎每个人的贡献！以下是你可以帮助改进 React DevTools Plus 的方式。',
          welcome: {
            title: '感谢你的贡献！',
            description: '无论是代码、文档还是反馈——每一份贡献都有助于让 DevTools+ 变得更好。',
          },
          ways: {
            title: '贡献方式',
            items: [
              '在 GitHub 上报告 bug 和问题',
              '建议新功能和改进',
              '提交包含 bug 修复的 pull request',
              '改进文档和示例',
              '在讨论中帮助其他用户',
              '与他人分享项目',
            ],
          },
          setup: {
            title: '开发环境设置',
            clone: {
              title: '1. Fork 和克隆',
            },
            install: {
              title: '2. 安装和构建',
            },
          },
          pr: {
            title: '提交 Pull Request',
            description: '按照以下步骤提交你的更改：',
          },
          guidelines: {
            title: '贡献指南',
            items: [
              '遵循现有的代码风格',
              '编写清晰的提交信息',
              '为新功能添加测试',
              '根据需要更新文档',
              '保持 PR 专注且小',
              '在讨论中保持尊重',
            ],
          },
          cta: {
            fork: '在 GitHub 上 Fork',
            issues: '查看 Issues',
          },
        },
        faq: {
          title: '常见问题',
          description: '关于 React DevTools Plus 常见问题的快速解答。',
          noAnswer: {
            title: '找不到你的答案？',
            description: '如果你的问题在这里没有解答，',
            link: '在 GitHub 上提交 issue',
          },
          items: [
            {
              question: 'DevTools+ 在生产环境中工作吗？',
              answer: '默认不会。DevTools+ 设计为仅开发环境使用。插件会自动从生产构建中排除自身。你可以使用 enabledEnvironments 选项在特定环境中明确启用它。',
            },
            {
              question: '它支持 React 19 吗？',
              answer: '是的！React DevTools Plus 支持 React 16.8+，包括 React 17、18 和 19。',
            },
            {
              question: '我可以不用 Vite 使用吗？',
              answer: '可以！我们也支持 Webpack 4 和 5，功能完全一致。详情请参阅 Webpack 设置指南。',
            },
            {
              question: '它会拖慢我的应用吗？',
              answer: '覆盖层在开发期间增加的开销很小。在生产环境中，由于插件不包含，影响为零。',
            },
            {
              question: '我可以与官方 React DevTools 扩展一起使用吗？',
              answer: '可以，但我们建议一次只使用一个以避免重复更新。它们基于不同的原理工作，可能显示略有不同的信息。',
            },
            {
              question: '有任何遥测吗？',
              answer: '没有。React DevTools Plus 不收集任何遥测数据。所有内容都在你的浏览器本地运行。',
            },
          ],
        },
        troubleshooting: {
          title: '故障排除',
          description: '你可能遇到的常见问题的解决方案。',
          pluginNotLoading: {
            title: '插件未加载',
            description: '如果 DevTools 覆盖层没有出现，尝试重新构建插件：',
          },
          editorNotOpening: {
            title: '编辑器未打开',
            error: '错误："spawn cursor ENOENT" 或 "command not found"',
            cause: '这意味着编辑器 CLI 未安装或不在你的 PATH 中。',
            solution: {
              title: '安装 CLI 工具',
            },
            fallback: {
              title: '替代方案：设置回退编辑器',
            },
          },
          overlayNotShowing: {
            title: '覆盖层未显示',
            description: '如果覆盖层没有出现：',
            checks: [
              '确保你处于开发模式',
              '检查插件是否正确配置',
              '尝试按 Alt+Shift+D 切换',
              '检查浏览器控制台是否有错误',
              '验证插件没有被环境禁用',
            ],
          },
          conflictWithExtension: {
            title: '与浏览器扩展冲突',
            description: '如果你安装了官方 React DevTools 浏览器扩展，你可能会看到重复更新。我们建议在使用另一个时禁用其中一个。',
          },
          sourceLocations: {
            title: '源位置不正确',
            description: '如果"在编辑器中打开"打开了错误的位置：',
            checks: [
              '确保启用了 source maps',
              '检查 HTML 中是否存在 data-source-path 属性',
              '验证 Babel 没有与插件冲突',
              '确保 ReactDevTools() 在其他 React 插件之前',
            ],
          },
          stillStuck: {
            title: '仍然有问题？',
            description: '如果你仍然卡住了，',
            link: '在 GitHub 上提交 issue',
          },
        },
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
