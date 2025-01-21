import { Router } from 'express';
import { readJsonFile } from '../utils/fileReader.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get('/', (req, res) => {
  try {
    const now = new Date();
    const dayIndex = now.getDay();    
    const dayName = daysOfWeek[dayIndex]; 
    const dayOfMonth = now.getDate();   

    const fileName = `${dayName} ${dayOfMonth}-en/matches.json`;
    const matchesPath = path.join(__dirname, '../matches_dates', fileName);

    if (!fs.existsSync(matchesPath)) {
      return res.status(404).json({ error: `No matches found for ${fileName}` });
    }

    const matches = readJsonFile(matchesPath);
    if (!matches) {
      return res.status(404).json({ error: 'No matches found' });
    }

    const { status } = req.query;
    const allMatches = Object.values(matches).flat();
    const filteredMatches = status
      ? allMatches.filter(match => match.status === status.toUpperCase())
      : allMatches;

    res.json(filteredMatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;