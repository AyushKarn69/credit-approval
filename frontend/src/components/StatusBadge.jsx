import { motion } from 'framer-motion'
import styles from './StatusBadge.module.css'

export function StatusBadge({ approved, size = 'md' }) {
  const status = approved ? 'approved' : 'denied'
  const text = approved ? '✓ APPROVED' : '✕ DENIED'

  return (
    <motion.div
      className={`${styles.badge} ${styles[`badge--${status}`]} ${styles[`badge--${size}`]}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {text}
    </motion.div>
  )
}
