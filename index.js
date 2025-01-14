import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ROUNDS = 16;
const OUTPUT_DIR = './matches';
const DELAY = 2000; 

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeRound(page, roundNumber) {
    const matches = await page.evaluate((round) => {
      const matchElements = document.querySelectorAll('.Box.dtLxRI');
      const matchData = [];
      
      matchElements.forEach(el => {
        const leftTeamEl = el.querySelector('[data-testid="left_team"]');
        const rightTeamEl = el.querySelector('[data-testid="right_team"]');
        const dateElement = el.closest('div[class*="sc-"]').querySelector('.Text.kcRyBI');
        const timeElement = el.closest('div[class*="sc-"]').querySelector('.Text.kkVniA');
  
        const homeTeamImg = leftTeamEl.querySelector('img').src;
        const awayTeamImg = rightTeamEl.querySelector('img').src;
        const homeTeam = leftTeamEl.querySelector('.Text.ezSveL').innerText.trim();
        const awayTeam = rightTeamEl.querySelector('.Text.ezSveL').innerText.trim();
        const date = dateElement ? dateElement.innerText.trim() : 'N/A';
        const time = timeElement ? timeElement.innerText.trim() : 'N/A';
  
        matchData.push({
          homeTeam,
          homeTeamImg,
          awayTeam,
          awayTeamImg,
          date,
          time,
          round
        });
      });
      return matchData;
    }, roundNumber);
    
    return matches;
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://www.sofascore.com/tournament/football/argentina/liga-profesional-de-futbol/155#id:70268,tab:matches', { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    for (let round = 1; round <= ROUNDS; round++) {
      console.log(`Scraping round ${round}...`);
      
      if (round > 1) {
        await page.waitForSelector('.Button.iCnTrv:last-child');
        await page.click('.Button.iCnTrv:last-child');
        await delay(DELAY); 
      }

      const matches = await scrapeRound(page, round);
      
      const filename = path.join(OUTPUT_DIR, `round_${round}.json`);
      fs.writeFileSync(filename, JSON.stringify(matches, null, 2));

      await delay(DELAY);
    }

    await browser.close();
    console.log('Todos los partidos guardados');
  } catch (error) {
    console.error('Error:', error);
  }
})();