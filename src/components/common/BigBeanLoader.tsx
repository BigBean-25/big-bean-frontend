import styles from './BigBeanLoader.module.css'

export default function BigBeanLoader() {
  return (
    <div className={styles.loaderWrap}>
      <div className={styles.logoMark}>BIG BEAN</div>

      <div className={styles.loader} aria-label="Loading">
        {Array.from({ length: 9 }).map((_, index) => (
          <div className={styles.text} key={index}>
            <span>Loading</span>
          </div>
        ))}
        <div className={styles.line} />
      </div>

      <p className={styles.caption}>Brewing your experience...</p>
    </div>
  )
}
