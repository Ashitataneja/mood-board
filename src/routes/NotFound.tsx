import { Link } from 'react-router-dom';
import styles from './stub.module.css';

// Phase 10 adds the confused crowd.
export default function NotFound() {
  return (
    <main id="main" className={styles.stage}>
      <h1 className="display">404</h1>
      <p>
        Nothing here. <Link to="/">Back to the crowd?</Link>
      </p>
    </main>
  );
}
