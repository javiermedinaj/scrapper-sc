import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import premierRoutes from './routes/premier.routes.js';
import argentinaRoutes from './routes/argentina.routes.js';
import liveRoutes from './routes/live.routes.js';
import indexRoutes from './routes/index.routes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', indexRoutes);
app.use('/api/premier', premierRoutes);
app.use('/api/argentina', argentinaRoutes);
app.use('/api/matches/live', liveRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;