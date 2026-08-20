"use client"

import { useTheme } from '@/contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        onDark
          ? 'hover:bg-white/10'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FiMoon className={`w-5 h-5 ${onDark ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`} />
      ) : (
        <FiSun className={`w-5 h-5 ${onDark ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`} />
      )}
    </motion.button>
  )
}