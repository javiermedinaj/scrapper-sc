import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join('matches_premier', 'table_position');
const OUTPUT_FILE = 'table_position.json';
const URL = 'https://www.promiedos.com.ar/league/premier-league/h';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function scrapeTable() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
    
    await page.waitForSelector('.table_table__LTgjZ', { timeout: 30000 });

    const tableData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.table_table__LTgjZ tbody tr')).slice(0, 20);
      const data = [];

      rows.forEach(row => {
        if (row.querySelector('.table_team_block__y6rYP')) {
          const positionCell = row.querySelector('td:first-child');
          const statusColor = positionCell?.style?.color || '';
          let status = 'none';
          
          if (statusColor === '#76B300') status = 'champions';
          if (statusColor === '#03A9F4') status = 'europa';
          if (statusColor === '#FF5200') status = 'relegation';

          const teamBlock = row.querySelector('.table_team_block__y6rYP');
          
          data.push({
            position: row.querySelector('td:first-child span')?.innerText || '',
            teamName: teamBlock?.querySelector('p')?.innerText || '',
            teamImg: teamBlock?.querySelector('img')?.src || '',
            points: row.querySelector('td:nth-child(3)')?.innerText || '',
            played: row.querySelector('td:nth-child(4)')?.innerText || '',
            goals: row.querySelector('td:nth-child(5)')?.innerText || '',
            goalDiff: row.querySelector('td:nth-child(6)')?.innerText || '',
            wins: row.querySelector('td:nth-child(7)')?.innerText || '',
            draws: row.querySelector('td:nth-child(8)')?.innerText || '',
            losses: row.querySelector('td:nth-child(9)')?.innerText || '',
            status,
            lastMatches: Array.from(
              row.querySelectorAll('.command-history-result_min__b0St0 div')
            ).map(el => el.innerText)
          });
        }
      });

      return data;
    });

    const filePath = path.join(OUTPUT_DIR, OUTPUT_FILE);
    fs.writeFileSync(filePath, JSON.stringify(tableData, null, 2));
    console.log('Table data saved successfully');

  } catch (error) {
    console.error('Error scraping table:', error);
  } finally {
    await browser.close();
  }
}

scrapeTable();