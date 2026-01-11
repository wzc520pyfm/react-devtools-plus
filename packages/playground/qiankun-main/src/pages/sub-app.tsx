import { MicroApp } from '@umijs/max'
import styles from './sub-app.less'

export default function SubAppPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>📦 Micro Frontend</div>
        <h1>Sub Application Container</h1>
        <p>The sub-app from port 8001 is rendered below via qiankun</p>
      </header>

      <div className={styles.appContainer}>
        {/* qiankun 子应用挂载点 */}
        <MicroApp name="sub-app" base="/sub" />
      </div>
    </div>
  )
}
