import express from 'express';
import { requests, generateId } from '../data/requests.js';

const router = express.Router();

// This router is mounted at /requests in app.js, so '/' here means GET /requests.

router.get('/', (req, res) => {
  res.status(200).json(requests);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.status(200).json(request);
});

router.post('/', (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newRequest = {
    id: generateId(),
    title,
    description: description || '',
    status: 'open',
    priority: priority || 'medium'
  };

  requests.push(newRequest);
  res.status(201).json(newRequest);
});

export default router;
