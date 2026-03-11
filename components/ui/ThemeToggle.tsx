"use client"

import { useTheme } from '@/contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      )}
    </motion.button>
  )
}
