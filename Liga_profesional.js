import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './matches_arg';
const DELAY = 2000;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeRound(page) {
  await page.waitForSelector('a.item_item__BqOgz', { timeout: 5000 }).catch(() => null);
  
  const matches = await page.evaluate(() => {
    const matchElements = document.querySelectorAll('a.item_item__BqOgz');
    const matchData = [];

    matchElements.forEach(match => {
      // Obtener equipos y sus imágenes
      const teams = match.querySelectorAll('.command_body__74uHo');
      
      const homeTeam = teams[0]?.querySelector('.comand-name__title')?.textContent?.trim() || '';
      const awayTeam = teams[1]?.querySelector('.comand-name__title')?.textContent?.trim() || '';
      
      // Obtener URLs de las imágenes
      const homeTeamImg = teams[0]?.querySelector('.comand-imageteam img')?.src || '';
      const awayTeamImg = teams[1]?.querySelector('.comand-imageteam img')?.src || '';

      // Obtener horario/fecha
      const date = match.querySelector('.time_time__GlBIn')?.textContent?.trim() || '';
      
      // Obtener resultado
      const scoreSpans = match.querySelectorAll('.result_number__14zEM span.scores_scoreseventresult__X_Y_1');
      let score = '';
      if(scoreSpans.length >= 2) {
        score = `${scoreSpans[0].textContent.trim()} - ${scoreSpans[1].textContent.trim()}`;
      }

      if (homeTeam || awayTeam) {
        matchData.push({
          homeTeam,
          homeTeamImg,
          awayTeam,
          awayTeamImg,
          date,
          score
        });
      }
    });

    return matchData;
  });

  return matches;
}

async function navigateToFirstRound(page) {
  await page.waitForSelector('.lucide-chevron-left', { timeout: 5000 });
  
  // Hacer clic en el botón izquierdo hasta que no se pueda más
  while (true) {
    try {
      await page.click('.lucide-chevron-left');
      await delay(1000);
      
      // Verificar si estamos en la primera fecha
      const roundText = await page.$eval('.select-trigger_button__ZuHhB', el => el.textContent);
      if (roundText.includes('Fecha 1')) {
        break;
      }
    } catch (error) {
      break; // Si hay error al hacer clic, asumimos que llegamos al inicio
    }
  }
}

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--window-size=1280,800'],
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
    
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);
    
    await page.goto('https://www.promiedos.com.ar/league/liga-profesional/hc');
    await delay(2000);

    // Navegar a la primera fecha antes de empezar
    await navigateToFirstRound(page);
    await delay(2000);

    let currentRound = 1;
    
    while (currentRound <= 16) {
      console.log(`Scraping round ${currentRound}`);

      const roundMatches = await scrapeRound(page);
      
      if (roundMatches.length > 0) {
        // Add round number to matches after scraping
        roundMatches.forEach(match => match.round = currentRound);
        
        const filename = path.join(OUTPUT_DIR, `round_${currentRound}.json`);
        fs.writeFileSync(filename, JSON.stringify(roundMatches, null, 2));
        console.log(`Saved ${roundMatches.length} matches for round ${currentRound}`);
      } else {
        console.warn(`No matches found for round ${currentRound}`);
      }

      if (currentRound < 16) {
        await page.click('.lucide-chevron-right');
        await delay(2000);
      }

      currentRound++;
    }

    await browser.close();
    console.log('Scraping completed');

  } catch (error) {
    console.error('Error:', error);
  }
})();