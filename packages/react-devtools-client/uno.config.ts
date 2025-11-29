import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        mono: 'DM Mono',
      },
    }),
  ],
  theme: {
    colors: {
      primary: {
        50: 'var(--color-primary-50)',
        100: 'var(--color-primary-100)',
        200: 'var(--color-primary-200)',
        300: 'var(--color-primary-300)',
        400: 'var(--color-primary-400)',
        500: 'var(--color-primary-500)',
        600: 'var(--color-primary-600)',
        700: 'var(--color-primary-700)',
        800: 'var(--color-primary-800)',
        900: 'var(--color-primary-900)',
        DEFAULT: 'var(--color-primary-500)',
      },
    },
  },
  shortcuts: [
    {
      'bg-base': 'bg-white dark:bg-[#121212]',
      'text-base': 'text-black dark:text-[#dfe0e2]',
      'border-base': 'border-gray-200 dark:border-gray-800',
      'panel-grids': 'panel-grids-light dark:panel-grids-dark',
    },
    // Dynamic card shortcut to match Vue DevTools style
    // Usage: theme-card-primary
    [/^theme-card-(\w+)$/, $ => `p2 flex gap2 border border-base bg-base items-center rounded min-w-40 min-h-25 justify-center transition-all saturate-0 op70 shadow hover:(op100 bg-[color-mix(in_srgb,var(--color-${$[1]}-500),transparent_90%)] text-${$[1]}-600 saturate-100) dark:hover:(bg-[color-mix(in_srgb,var(--color-${$[1]}-500),transparent_90%)] text-${$[1]}-300)`],
    ['theme-card-green', 'p2 flex gap2 border border-base bg-base items-center rounded min-w-40 min-h-25 justify-center transition-all saturate-0 op50 shadow hover:(op100 bg-[color-mix(in_srgb,var(--color-green-500),transparent_90%)] text-green-600 saturate-100) dark:hover:(bg-[color-mix(in_srgb,var(--color-green-500),transparent_90%)] text-green-300)'],
    ['theme-card-orange', 'p2 flex gap2 border border-base bg-base items-center rounded min-w-40 min-h-25 justify-center transition-all saturate-0 op50 shadow hover:(op100 bg-[color-mix(in_srgb,var(--color-orange-500),transparent_90%)] text-orange-600 saturate-100) dark:hover:(bg-[color-mix(in_srgb,var(--color-orange-500),transparent_90%)] text-orange-300)'],
  ],
  rules: [
    ['panel-grids-light', {
      'background-image': 'url("data:image/svg+xml,%0A%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' transform=\'scale(3)\'%3E%3Crect x=\'0\' y=\'0\' width=\'100%25\' height=\'100%25\' fill=\'white\'/%3E%3Cpath d=\'M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z\' stroke-width=\'0.2\' stroke=\'hsla(0, 0%25, 98%25, 1)\' fill=\'none\'/%3E%3C/svg%3E")',
      'background-size': '40px 40px',
    }],
    ['panel-grids-dark', {
      'background-image': `url("data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' transform='scale(3)'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='${encodeURIComponent('#121212')}'/%3E%3Cpath d='M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z' stroke-width='0.2' stroke='${encodeURIComponent('#121212')}' fill='none'/%3E%3C/svg%3E");`,
      'background-size': '40px 40px',
    }],
  ],
})
