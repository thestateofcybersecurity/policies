// pages/api/templates/index.js
import dbConnect from '../../../utils/dbConnect';
import PolicyTemplate from '../../../models/PolicyTemplate';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const templates = await PolicyTemplate.find({});
        res.status(200).json({ success: true, data: templates });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'POST':
      try {
        const template = await PolicyTemplate.create(req.body);
        res.status(201).json({ success: true, data: template });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
