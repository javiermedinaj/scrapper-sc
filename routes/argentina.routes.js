import { Router } from 'express';
import { readJsonFile } from '../utils/fileReader.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

const FIXTURE_PATH = path.join(__dirname, '../matches_arg/all/full_fixture.json');

router.get("/", (req, res) => {
  res.send("Welcome to api argentina");
});

router.get('/fixture', (req, res) => {
  try {
    const fixture = readJsonFile(FIXTURE_PATH);
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
    res.json(fixture);
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
    const fullFixture = readJsonFile(FIXTURE_PATH);
    if (!fullFixture || !fullFixture.rounds) {
      return res.status(404).json({ error: 'Fixture data not found' });
    }
    const roundData = fullFixture.rounds.find(round => round.round_number === roundId);
    if (!roundData) return res.status(404).json({ error: `Round ${roundId} not found` });
    res.json(roundData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;