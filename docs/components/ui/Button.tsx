import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  withBeam?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  withBeam = false,
  ...props
}) => {
  const baseStyles
    = 'relative inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-400/40 focus-visible:ring-offset-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    primary: 'bg-slate-950 text-white shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_-5px_rgba(14,165,233,0.5)] hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-white/10 text-white hover:bg-white/15 backdrop-blur-sm border border-white/10',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  }

  if (withBeam) {
    return (
      <button
        className={`group focus-visible:ring-brand-400/40 relative overflow-hidden rounded-full p-[1px] transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 ${className}`}
        {...props}
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="h-full w-full inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-3 text-sm text-white font-medium backdrop-blur-3xl transition-all duration-300 active:scale-[0.98] group-hover:bg-slate-900/90">
          {children}
        </span>
      </button>
    )
  }

  return (
    <button className={`${baseStyles}  ${variants[variant]}  ${className}`} {...props}>
      {children}
    </button>
  )
}
