import fs from 'fs';

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Object|null} Parsed JSON data or null if error
 */
export const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};