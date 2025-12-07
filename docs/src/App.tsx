import { DocsCTA } from './components/DocsCTA'
import { FeatureGrid } from './components/FeatureGrid'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Integration } from './components/Integration'
import { Navbar } from './components/Navbar'
import { OpenSource } from './components/OpenSource'
import { Testimonials } from './components/Testimonials'
import { ValueProps } from './components/ValueProps'

function App() {
  return (
    <div className="selection:bg-brand-500/30 selection:text-brand-200 min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <FeatureGrid />
        <Integration />
        <Testimonials />
        <OpenSource />
        <DocsCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
