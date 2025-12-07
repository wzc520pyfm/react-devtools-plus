export interface Feature {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
  gradient?: string
}

export interface Testimonial {
  quote: string
  author: string
  role: string
  avatar?: string
}

export interface NavLink {
  label: string
  href: string
}
