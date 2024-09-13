import dbConnect from '../utils/dbConnect';
import PolicyTemplate from '../models/PolicyTemplate';

async function migrateCategoryField() {
  await dbConnect();

  try {
    // Update all documents without a category to 'NIST CSF' (or whichever default you prefer)
    const result = await PolicyTemplate.updateMany(
      { category: { $exists: false } },
      { $set: { category: 'NIST CSF' } }
    );

    console.log(`Updated ${result.nModified} documents`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateCategoryField();
