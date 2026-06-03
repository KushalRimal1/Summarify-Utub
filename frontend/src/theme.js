// Centralized theme configuration
export const themeConfig = {
  // Color palette
  colors: {
    dark: {
      background: '#0A0A0A',
      paper: '#1A1A1A',
      text: {
        primary: '#FFFFFF',
        secondary: '#A1A1AA',
      },
      accent: {
        primary: '#EF4444', // Reddish accent for inputs/buttons
        secondary: '#A855F7', // Purple for other accents
        tertiary: '#60A5FA', // Blue
        yellow: '#FBBF24',
      },
      border: {
        default: 'rgba(239, 68, 68, 0.2)', // Reddish border
        hover: 'rgba(239, 68, 68, 0.4)',
        focus: '#EF4444',
      },
    },
    light: {
      background: '#F8FAFC',
      paper: '#FFFFFF',
      text: {
        primary: '#1E293B',
        secondary: '#64748B',
      },
      accent: {
        primary: '#EF4444', // Reddish accent
        secondary: '#6EE7B7', // Green
        tertiary: '#3B82F6', // Blue
        yellow: '#F59E0B',
      },
      border: {
        default: 'rgba(239, 68, 68, 0.2)',
        hover: 'rgba(239, 68, 68, 0.4)',
        focus: '#EF4444',
      },
    },
  },
  
  // Typography
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  
  // Spacing
  spacing: {
    padding: {
      xs: '1.5rem',
      md: '2rem',
    },
    gap: {
      xs: '1.5rem',
      md: '2rem',
    },
  },
  
  // Border radius
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    pill: '20px',
  },
};

