'use client'

import { motion, Variants } from 'framer-motion'

export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1
    // REMOVED: transition property to avoid TypeScript error
  }
}

export const statCardVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1
  },
  hover: {
    y: -5
  }
}

export const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  )
}