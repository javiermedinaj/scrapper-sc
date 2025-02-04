import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roundsDir = path.join(__dirname, 'matches_arg');
const totalRounds = 16;
const rounds = [];

for (let round = 1; round <= totalRounds; round++) {
  const fileName = `round_${round}.json`;
  const filePath = path.join(roundsDir, fileName);
  
  if (fs.existsSync(filePath)) {
    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = rawData.replace(/^\s*\/\/.*$/gm, '');
      const matches = JSON.parse(jsonData);
      rounds.push({
        round_number: round,
        matches: matches.map(({ round, ...rest }) => rest)
      });
    } catch (error) {
      console.error(`Error al procesar ${fileName}:`, error);
    }
  } else {
    console.warn(`Archivo ${fileName} no encontrado.`);
  }
}

const fullFixture = {
  tournament: "Liga Profesional",
  season: "2025",
  rounds
};

const outputPath = path.join(__dirname, 'matches_arg/all/full_fixture.json');
fs.writeFileSync(outputPath, JSON.stringify(fullFixture, null, 2), 'utf8');

console.log('Fixture combinado exitosamente en:', outputPath);