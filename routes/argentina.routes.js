import { Router } from 'express';
import { readJsonFile } from '../utils/fileReader.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get("/", (req, res) => {
  res.send("Welcome to api argentina");
});

router.get('/rounds', (req, res) => {
  try {
    const rounds = [];
    for (let round = 1; round <= 16; round++) {
      const roundPath = path.join(__dirname, `../matches_arg/round_${round}.json`);
      if (fs.existsSync(roundPath)) {
        rounds.push(round);
      }
    }
    res.json({ rounds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/round/:id', (req, res) => {
  try {
    const roundId = parseInt(req.params.id);
    
    if (isNaN(roundId) || roundId < 1 || roundId > 16) {
      return res.status(400).json({ error: 'Invalid round number' });
    }

    const roundPath = path.join(__dirname, `../matches_arg/round_${roundId}.json`);
    const roundData = readJsonFile(roundPath);

    if (!roundData) {
      return res.status(404).json({ error: `Round ${roundId} not found` });
    }

    res.json(roundData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;