import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './matches';
const DELAY = 2000;

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapePremierMatches(page) {
  const matches = await page.evaluate(() => {
    const matchElements = document.querySelectorAll('.match-fixture');
    const matchData = [];

    matchElements.forEach(el => {
      const homeTeam = el.getAttribute('data-home');
      const awayTeam = el.getAttribute('data-away');
      const venue = el.getAttribute('data-venue');
      
      const homeTeamImg = el.querySelector('.match-fixture__team:first-child .badge-image').src;
      const awayTeamImg = el.querySelector('.match-fixture__team:last-child .badge-image').src;
      
      const kickoffTimestamp = el.getAttribute('data-comp-match-item-ko');
      const date = new Date(parseInt(kickoffTimestamp)).toLocaleDateString();
      const time = el.querySelector('time').innerText;

      matchData.push({
        homeTeam,
        homeTeamImg,
        awayTeam, 
        awayTeamImg,
        venue,
        date,
        time
      });
    });

    return matchData;
  });

  return matches;
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.premierleague.com/fixtures', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    await delay(DELAY);

    const matches = await scrapePremierMatches(page);
    
    const filename = path.join(OUTPUT_DIR, 'premier_matches.json');
    fs.writeFileSync(filename, JSON.stringify(matches, null, 2));

    await browser.close();
    console.log('Premier League matches saved successfully');

  } catch (error) {
    console.error('Error:', error);
  }
})();