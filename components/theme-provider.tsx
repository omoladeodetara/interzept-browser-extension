import * as React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  attribute?: string
  value?: any
  disableTransitionOnChange?: boolean
}

// Simple theme provider for React (without Next.js dependency)
export function ThemeProvider({ 
  children, 
  defaultTheme = "dark",
  enableSystem = false,
  attribute = "class",
  ...props 
}: ThemeProviderProps) {
  React.useEffect(() => {
    // Set dark theme by default
    if (defaultTheme === "dark") {
      document.documentElement.classList.add('dark')
    }
  }, [defaultTheme])

  return <>{children}</>
}
