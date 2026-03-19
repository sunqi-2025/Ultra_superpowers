import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sessionsRouter from './src/routes/sessions.js';
import requestsRouter from './src/routes/requests.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/sessions', sessionsRouter);
app.use('/api/requests', requestsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(express.static(join(__dirname, '../api-recorder-ui/dist')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../api-recorder-ui/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`API Recorder Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
