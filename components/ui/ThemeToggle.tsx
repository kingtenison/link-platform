"use client"

import { useTheme } from '@/contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const { toggleTheme } = useTheme()

  const iconClass = `w-5 h-5 ${onDark ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`

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
      <span className="dark:hidden">
        <FiMoon className={iconClass} />
      </span>
      <span className="hidden dark:inline">
        <FiSun className={iconClass} />
      </span>
    </motion.button>
  )
}
