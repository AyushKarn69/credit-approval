import styles from './PageHeader.module.css'

export function PageHeader({ title, subtitle, icon }) {
  return (
    <div className={styles.header}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  )
}
