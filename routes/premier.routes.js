import { Router } from 'express';
import { readJsonFile } from '../utils/fileReader.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();


router.get("/", (req, res) => {
  res.send("Welcome to api premier");
});

router.get('/table', (req, res) => {
  const tableData = readJsonFile(path.join(__dirname, '../matches_premier/table_position/table_position.json'));
  if (!tableData) {
    return res.status(404).json({ error: 'Table data not found' });
  }
  res.json(tableData);
});

router.get('/matches', (req, res) => {
  const { matchday } = req.query;
  const allMatches = [];
  const matchdaysToLoad = matchday ? [parseInt(matchday)] : Array.from({length: 38}, (_, i) => i + 1);

  for (const day of matchdaysToLoad) {
    const matchPath = path.join(__dirname, `../matches_premier/fecha${day}.json`);
    if (fs.existsSync(matchPath)) {
      const matchData = readJsonFile(matchPath);
      if (matchData) {
        allMatches.push(...matchData.map(match => ({...match, matchday: day})));
      }
    }
  }

  res.json(allMatches);
});

router.get('/matchday/:id', (req, res) => {
  try {
    const matchdayId = parseInt(req.params.id);
    
    if (isNaN(matchdayId) || matchdayId < 1 || matchdayId > 38) {
      return res.status(400).json({ error: 'Invalid matchday number' });
    }

    const matchPath = path.join(__dirname, `../matches_premier/fecha${matchdayId}.json`);
    
    if (!fs.existsSync(matchPath)) {
      return res.status(404).json({ error: `Matchday ${matchdayId} not found` });
    }

    const matchData = readJsonFile(matchPath);
    if (!matchData) {
      return res.status(404).json({ error: `Error reading matchday ${matchdayId}` });
    }

    const matchesWithDay = matchData.map(match => ({
      ...match,
      matchday: matchdayId
    }));

    res.json(matchesWithDay);
  } catch (error) {
    console.error(`Error in /matchday/${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;