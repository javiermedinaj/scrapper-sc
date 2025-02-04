import { Router } from 'express';
import { readJsonFile } from '../utils/fileReader.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get('/', (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const fileName = `${year}-${month}-${day}.json`;
    
    const matchesPath = path.join(__dirname, '../matches_dates', year.toString(), month, fileName);
    
    if (!fs.existsSync(matchesPath)) {
      return res.status(404).json({ error: 'No se encontró datos para hoy.' });
    }
    
    const data = readJsonFile(matchesPath);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;