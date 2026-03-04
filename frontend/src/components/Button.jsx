import { motion } from 'framer-motion'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

export function Button({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  type = 'button'
}) {
  return (
    <motion.button
      className={`${styles.button} ${styles[`button--${variant}`]}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.12 }}
    >
      {loading ? (
        <>
          <Spinner /> Processing...
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
