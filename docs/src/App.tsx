import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DocsCTA } from './components/DocsCTA'
import { FeatureGrid } from './components/FeatureGrid'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Integration as IntegrationSection } from './components/Integration'
import { Navbar } from './components/Navbar'
import { OpenSource } from './components/OpenSource'
import { Testimonials } from './components/Testimonials'
import { ValueProps } from './components/ValueProps'
import { DocsLayout } from './layouts/DocsLayout'
import {
  Assets,
  Community,
  ComponentTree,
  Configuration,
  Contributing,
  FAQ,
  Features,
  Installation,
  Integration,
  Introduction,
  ModuleGraph,
  OpenInEditor,
  Plugins,
  QuickStart,
  Scan,
  Timeline,
  Troubleshooting,
  ViteSetup,
  WebpackSetup,
} from './pages'

function HomePage() {
  return (
    <div className="selection:bg-brand-500/30 selection:text-brand-200 min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <FeatureGrid />
        <IntegrationSection />
        <Testimonials />
        <OpenSource />
        <DocsCTA />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Feature Pages */}
        <Route path="/features" element={<Features />} />
        <Route path="/integration" element={<Integration />} />
        <Route path="/community" element={<Community />} />

        {/* Docs Pages with Layout */}
        <Route path="/docs" element={<DocsLayout />}>
          {/* Getting Started */}
          <Route index element={<Introduction />} />
          <Route path="installation" element={<Installation />} />
          <Route path="quick-start" element={<QuickStart />} />

          {/* Features */}
          <Route path="features/component-tree" element={<ComponentTree />} />
          <Route path="features/timeline" element={<Timeline />} />
          <Route path="features/assets" element={<Assets />} />
          <Route path="features/open-in-editor" element={<OpenInEditor />} />
          <Route path="features/scan" element={<Scan />} />
          <Route path="features/module-graph" element={<ModuleGraph />} />
          <Route path="features/plugins" element={<Plugins />} />

          {/* Integration */}
          <Route path="integration/vite" element={<ViteSetup />} />
          <Route path="integration/webpack" element={<WebpackSetup />} />
          <Route path="integration/configuration" element={<Configuration />} />

          {/* Help */}
          <Route path="contributing" element={<Contributing />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="troubleshooting" element={<Troubleshooting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
