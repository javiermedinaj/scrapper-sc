import { Router } from 'express';
import { readJsonFile } from '../utils/fileReader.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

const FIXTURE_PATH = path.join(__dirname, '../matches_arg/all/full_fixture.json');
const TABLA_ANUAL_PATH = path.join(__dirname, '../matches_arg/tables/tablaAnual.json');
const PROMEDIOS2025_PATH = path.join(__dirname, '../matches_arg/tables/promedios2025.json');
const GRUPOS_PATH = path.join(__dirname, '../matches_arg/tables/grupos.json');

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

//ruta de tablas 
router.get('/anual', (req, res) => {
  try {
    const data = readJsonFile(TABLA_ANUAL_PATH);
    if (!data) return res.status(404).json({ error: 'No se encontró la tabla anual' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/promedios', (req, res) => {
  try {
    const data = readJsonFile(PROMEDIOS2025_PATH);
    if (!data) return res.status(404).json({ error: 'No se encontró la tabla de promedios' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grupos
router.get('/grupos', (req, res) => {
  try {
    const data = readJsonFile(GRUPOS_PATH);
    if (!data) return res.status(404).json({ error: 'No se encontraron los grupos' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;