import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_FILE = join(__dirname, './data/tabla.json');
const OUTPUT_FILE = join(__dirname, './data/tabla_clean.json');

async function cleanTabla() {
  try {
    const data = await readFile(INPUT_FILE, 'utf8');
    const tabla = JSON.parse(data);
    const cleanedGroups = [];

    tabla.forEach(group => {
      const cleanedTeams = [];
      const teamNames = new Set();

      group.teams.forEach(team => {
        if (team.teamName && !teamNames.has(team.teamName)) {
          // Clean and normalize team data
          cleanedTeams.push({
            position: team.position || "",
            teamName: team.teamName.trim(),
            played: parseInt(team.played, 10) || 0,
            won: parseInt(team.won, 10) || 0,
            drawn: parseInt(team.drawn, 10) || 0,
            lost: parseInt(team.lost, 10) || 0,
            goalsFor: parseInt(team.goalsFor, 10) || 0,
            goalsAgainst: parseInt(team.goalsAgainst, 10) || 0,
            goalDiff: parseInt(team.goalDiff, 10) || 0,
            points: parseInt(team.points, 10) || 0
          });
          teamNames.add(team.teamName);
        }
      });

      if (cleanedTeams.length > 0) {
        // Optionally compute averages or other statistics here

        cleanedGroups.push({
          name: group.name,
          teams: cleanedTeams
        });
      }
    });

    await writeFile(
      OUTPUT_FILE,
      JSON.stringify(cleanedGroups, null, 2)
    );

    console.log('Cleaned tabla data saved successfully!');
  } catch (error) {
    console.error('Error cleaning tabla:', error);
  }
}

cleanTabla();