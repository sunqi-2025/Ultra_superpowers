import express from 'express';
import { storageService } from '../services/storageService.js';

const router = express.Router();

router.get('/:id', (req, res) => {
  try {
    const request = storageService.getRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, request });
  } catch (error) {
    console.error('Failed to get request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const success = storageService.deleteRequest(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
