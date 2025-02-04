import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../matches_arg/tables');

async function ensureDirectoryExists(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

async function scrapeArgTable() {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1200, height: 763 }
  });

  try {
    await ensureDirectoryExists(OUTPUT_DIR);
    const page = await browser.newPage();
    
    await page.goto('https://www.promiedos.com.ar/league/liga-profesional/hc', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await page.waitForSelector('table', { timeout: 10000 });

    const tableData = await page.evaluate(() => {
      const data = {
        grupos: {
          grupoA: [],
          grupoB: []
        },
        tablaAnual: [],
        promedios2025: []
      };

      const tables = document.querySelectorAll('table');
      
      tables.forEach((table, index) => {
        const rows = table.querySelectorAll('tr');
        const tableInfo = [];

        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          const rowData = [];
          cells.forEach(cell => {
            rowData.push(cell.textContent.trim());
          });
          tableInfo.push(rowData);
        });

        if (index === 0) { // Grupo A
          data.grupos.grupoA = tableInfo.slice(1);
        } else if (index === 1) { // Grupo B
          data.grupos.grupoB = tableInfo.slice(1);
        } else if (index === 2) { // Tabla Anual
          data.tablaAnual = tableInfo.slice(1);
        } else if (index === 3) { // Promedios 2025
          data.promedios2025 = tableInfo.slice(1);
        }
      });

      return data;
    });

    console.log('Table data extracted:', tableData);
    
    await writeFile(
      join(OUTPUT_DIR, 'grupos.json'),
      JSON.stringify(tableData.grupos, null, 2)
    );

    await writeFile(
      join(OUTPUT_DIR, 'tablaAnual.json'),
      JSON.stringify(tableData.tablaAnual, null, 2)
    );

    await writeFile(
      join(OUTPUT_DIR, 'promedios2025.json'),
      JSON.stringify(tableData.promedios2025, null, 2)
    );

    console.log('All tables saved successfully!');

  } catch (error) {
    console.error('Error details:', error);
  } finally {
    await browser.close();
  }
}

scrapeArgTable();