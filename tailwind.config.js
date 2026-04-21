/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        bg: {
          base: '#0A0B0F',
          surface: '#0F1117',
          elevated: '#161820',
          overlay: '#1E2130',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          glow: 'rgba(79,70,255,0.27)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          light: '#6E67FF',
          dim: '#2E2A99',
          glow: 'rgba(79,70,255,0.2)',
        },
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        text: {
          primary: '#EAEAF5',
          secondary: '#9698B0',
          muted: '#5C5E78',
        },
        success: '#00E5A0',
        warning: '#FFC85C',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
        'pulse-glow': 'glowPulse 2s ease-in-out infinite alternate',
        'aurora': 'auroraShift 12s ease-in-out infinite alternate',
        'bar-grow': 'barGrow 0.8s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glowPulse: {
          from: { boxShadow: '0 0 20px rgba(79,70,255,0.3)' },
          to: { boxShadow: '0 0 50px rgba(79,70,255,0.7)' },
        },
        barGrow: {
          from: { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          to: { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
}
