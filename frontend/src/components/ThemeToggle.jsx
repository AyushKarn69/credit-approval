import { motion } from 'framer-motion'
import styles from './ThemeToggle.module.css'

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <motion.button
      className={styles.toggle}
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className={styles.track}
        animate={isDark ? { x: 0 } : { x: 22 }}
        transition={{ duration: 0.3 }}
      >
        <span className={styles.icon}>{isDark ? '☾' : '☀'}</span>
      </motion.div>
    </motion.button>
  )
}
