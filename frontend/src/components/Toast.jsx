import { motion } from 'framer-motion'
import styles from './Toast.module.css'

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ'
}

export function Toast({ message, type = 'info', onDismiss }) {
  return (
    <motion.div
      className={`${styles.toast} ${styles[`toast--${type}`]}`}
      initial={{ opacity: 0, y: 40, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <span className={styles.icon}>{ICONS[type]}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </motion.div>
  )
}
