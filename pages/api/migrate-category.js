// pages/api/migrate-category.js
import dbConnect from '../../utils/dbConnect';
import PolicyTemplate from '../../models/PolicyTemplate';

export default async function handler(req, res) {
  // Basic authentication
  const { authorization } = req.headers;
  if (authorization !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    await dbConnect();

    try {
      const result = await PolicyTemplate.updateMany(
        { category: { $exists: false } },
        { $set: { category: 'NIST CSF' } }
      );

      res.status(200).json({ message: `Updated ${result.nModified} documents` });
    } catch (error) {
      console.error('Migration failed:', error);
      res.status(500).json({ error: 'Migration failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
