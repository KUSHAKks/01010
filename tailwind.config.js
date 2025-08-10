/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'bounce': 'bounce 1.4s infinite ease-in-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#3B82F6',
              textDecoration: 'underline',
              '&:hover': {
                color: '#1D4ED8',
              },
            },
            code: {
              color: '#E11D48',
              backgroundColor: '#F1F5F9',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.375rem',
              fontWeight: '600',
              fontSize: '0.875em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1E293B',
              color: '#F1F5F9',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              border: '1px solid #334155',
            },
            blockquote: {
              borderLeftColor: '#3B82F6',
              backgroundColor: '#F8FAFC',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontStyle: 'normal',
            },
            h1: {
              color: 'inherit',
              fontWeight: '800',
            },
            h2: {
              color: 'inherit',
              fontWeight: '700',
            },
            h3: {
              color: 'inherit',
              fontWeight: '600',
            },
            h4: {
              color: 'inherit',
              fontWeight: '600',
            },
            strong: {
              color: 'inherit',
              fontWeight: '700',
            },
            ul: {
              listStyleType: 'disc',
            },
            ol: {
              listStyleType: 'decimal',
            },
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: '#374151',
              color: '#F9FAFB',
            },
            blockquote: {
              backgroundColor: '#374151',
              color: '#F9FAFB',
              borderLeftColor: '#60A5FA',
            },
            pre: {
              backgroundColor: '#0F172A',
              borderColor: '#475569',
            },
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      scrollbar: {
        thin: {
          width: '6px',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thumb-gray-300': {
          'scrollbar-color': '#D1D5DB transparent',
        },
        '.scrollbar-thumb-gray-600': {
          'scrollbar-color': '#4B5563 transparent',
        },
        '.scrollbar-track-transparent': {
          'scrollbar-track-color': 'transparent',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}