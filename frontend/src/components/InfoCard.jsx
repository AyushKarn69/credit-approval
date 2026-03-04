import styles from './InfoCard.module.css'

export function InfoCard({ title, items }) {
  return (
    <div className={styles.card}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.content}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.row}>
            <span className={styles.label}>{item.label}</span>
            <span className={`${styles.value} ${item.mono ? styles['value--mono'] : ''} ${item.highlight ? styles['value--highlight'] : ''}`}>
              {item.value}
              {item.highlight && <span className={styles.tag}>adjusted</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
