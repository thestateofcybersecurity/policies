// pages/api/templates/[id].js
import dbConnect from '../../../utils/dbConnect';
import PolicyTemplate from '../../../models/PolicyTemplate';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const template = await PolicyTemplate.findById(id);
        if (!template) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: template });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'PUT':
      try {
        const template = await PolicyTemplate.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!template) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: template });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'DELETE':
      try {
        const deletedTemplate = await PolicyTemplate.deleteOne({ _id: id });
        if (!deletedTemplate) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
