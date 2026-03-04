import { motion } from 'framer-motion'
import styles from './FormField.module.css'

export function FormField({
  label,
  hint,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  index = 0
}) {
  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {hint && <span className={styles.hint}>{hint}</span>}
      <input
        className={`${styles.input} ${error ? styles['input--error'] : ''}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=""
        disabled={false}
      />
      {error && (
        <motion.span
          className={styles.error}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.span>
      )}
    </motion.div>
  )
}
