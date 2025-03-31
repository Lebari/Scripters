export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    extend:{
      colors: {
        // Primary dark neutral colors
        black: {
          DEFAULT: '#0d0d0d', // Near black
          900: '#141414',     // Slightly lighter black for contrast
          800: '#1a1713',     // Rich dark brown-black (from luxury palettes)
          700: '#192231',     // Navy-black (from palette #2)
          600: '#252523',     // Deep charcoal (from palette #15)
        },
        
        // Gold/Bronze accent palette
        gold: {
          DEFAULT: '#d9b061', // Rich gold (from palette #5)
          light: '#c7af6b',   // Lighter gold (from palette #6)
          dark: '#a4893d',    // Deeper gold (from palette #6)
          muted: '#c89666',   // Muted gold/bronze (from palette #9)
        },
        
        // Green accent colors
        green: {
          DEFAULT: '#226F54', // Keep original brand green
          dark: '#314021',    // Deep forest green (from palette #8)
          light: '#87C38F',   // Keep original light green
          muted: '#557373',   // Muted teal-green (from palette #6)
        },
        
        // Secondary accent colors
        accent: {
          blue: '#021c41',    // Deep navy blue (from palette #7)
          red: '#a7382d',     // Deep burgundy (from palette #3)
          purple: '#8458B3',  // Rich purple (from palette #2)
        },
        
        // Neutral grays
        gray: {
          DEFAULT: '#393939', // Dark gray (from palette #9)
          900: '#333333',     // Carbon gray (high contrast ratio)
          800: '#3f3f3f',     // Second-hand gray (from palette #12)
          700: '#4f5f76',     // Gray-blue (from palette #3)
          600: '#819fa7',     // Blue-gray (from palette #9)
          400: '#bfafaf',     // Taupe-gray (from palette #10)
          300: '#d9d9d9',     // Light gray (from palette #10)
          100: '#f2f2f2',     // Near white gray (from palette #10)
        },
        
        // Old colors kept for backward compatibility
        red: '#a71f13',       // Updated to a deeper, more luxurious red
        brown: '#43291F',     // Kept original
        cream: '#dfe5f3',     // Updated to a cooler cream (from palette #6)
        offwhite: '#f2f1ef',  // Updated to a warmer off-white (from palette #2)
        offwhite_grey: '#d9d2cc', // Updated to a warmer gray (from palette #1)
        green_light: '#87C38F', // Kept original
        green_offwhite: '#BDCFBC', // Kept original
      },
      fontSize: {
        xs: '0.8rem',
        sm: '0.9rem',
        base: '1rem',
        xl: '1.25rem',
        '2xl': '1.563rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      }
    }
  },
  variants: {},
  plugins: [],
}
