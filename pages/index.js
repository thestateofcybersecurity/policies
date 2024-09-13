// pages/index.js
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faCog } from '@fortawesome/free-solid-svg-icons';
import '../styles/policy-styles.css';

export default function Home() {
  return (
    <div>
      <h1>Policy Management System</h1>
      <nav>
        <ul>
          <li>
            <Link href="/manage-templates">
              <a>
                <FontAwesomeIcon icon={faCog} /> Manage Templates
              </a>
            </Link>
          </li>
          <li>
            <Link href="/generate-policies">
              <a>
                <FontAwesomeIcon icon={faClipboard} /> Generate Policies
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
