import { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
}

export interface Feature {
  title: string
  description: string
  icon: LucideIcon
  colSpan?: number // For Bento Grid layout
}

export interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
}
