/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 修仙主题色彩
        xiu: {
          dark: '#0a0a0f',      // 深夜黑
          darker: '#050508',    // 更深黑
          navy: '#1a1a2e',      // 深靛蓝
          purple: '#2d1b4e',    // 深紫
          gold: '#d4af37',      // 金色
          goldLight: '#f4d03f', // 亮金
          cyan: '#00d4ff',      // 青色灵气
          cyanGlow: '#00ffff',  // 发光青
          red: '#ff4757',       // 火焰红
          green: '#2ecc71',     // 灵草绿
        }
      },
      fontFamily: {
        xiu: ['"Noto Serif SC"', 'serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '100%': { boxShadow: '0 0 20px #00d4ff, 0 0 30px #00d4ff' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-xiu': 'linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #0a0a0f 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
      }
    },
  },
  plugins: [],
}
