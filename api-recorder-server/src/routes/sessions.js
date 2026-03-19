import express from 'express';
import { storageService } from '../services/storageService.js';
import { exportService } from '../services/exportService.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const session = storageService.createSession(name);
    res.json({ success: true, session });
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const sessions = storageService.getAllSessions();
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Failed to get sessions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const session = storageService.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    const requests = storageService.getSessionRequests(req.params.id);
    const userActions = storageService.getSessionUserActions(req.params.id);
    res.json({ success: true, session, requests, userActions });
  } catch (error) {
    console.error('Failed to get session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, status } = req.body;
    const session = storageService.updateSession(req.params.id, { name, status });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Failed to update session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const success = storageService.deleteSession(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/requests', (req, res) => {
  try {
    const request = storageService.createRequest(req.params.id, req.body);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, request });
  } catch (error) {
    console.error('Failed to create request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/requests', (req, res) => {
  try {
    const requests = storageService.getSessionRequests(req.params.id);
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Failed to get requests:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/actions', (req, res) => {
  try {
    const action = storageService.createUserAction(req.params.id, req.body);
    if (!action) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, action });
  } catch (error) {
    console.error('Failed to create action:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/actions', (req, res) => {
  try {
    const actions = storageService.getSessionUserActions(req.params.id);
    res.json({ success: true, actions });
  } catch (error) {
    console.error('Failed to get actions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/export/markdown', (req, res) => {
  try {
    const markdown = exportService.generateMarkdown(req.params.id);
    if (!markdown) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="api-doc-${req.params.id}.md"`);
    res.send(markdown);
  } catch (error) {
    console.error('Failed to export markdown:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/export/json', (req, res) => {
  try {
    const json = exportService.generateJson(req.params.id);
    if (!json) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="api-doc-${req.params.id}.json"`);
    res.json(json);
  } catch (error) {
    console.error('Failed to export json:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/export/jmx', (req, res) => {
  try {
    const jmx = exportService.generateJmx(req.params.id);
    if (!jmx) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="api-test-${req.params.id}.jmx"`);
    res.send(jmx);
  } catch (error) {
    console.error('Failed to export jmx:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
