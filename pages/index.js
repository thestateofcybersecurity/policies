// pages/index.js
import Link from 'next/link';
import '../styles/policy-styles.css';

export default function Home() {
  return (
    <div>
      <h1>Policy Management System</h1>
      <nav>
        <ul>
          <li><Link href="/manage-templates"><a>Manage Templates</a></Link></li>
          <li><Link href="/generate-policies"><a>Generate Policies</a></Link></li>
        </ul>
      </nav>
    </div>
  );
}
