import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './matches_premier';
const DELAY = 2000;
const TOTAL_FECHAS = 38;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeMatches(page) {
  const matches = await page.evaluate(() => {
    const matchElements = document.querySelectorAll('.item_item__BqOgz');
    const matchData = [];

    matchElements.forEach(el => {
      const timeElem = el.querySelector('.time_time__GlBIn');
      const time = timeElem ? timeElem.textContent.trim() : 'Hora desconocida';

      const teamElems = el.querySelectorAll('.command_title__sMlhS');
      const team1 = teamElems[0]?.textContent.trim() || 'Equipo 1';
      const team2 = teamElems[1]?.textContent.trim() || 'Equipo 2';

      const imgElems = el.querySelectorAll('.comand-imageteam img');
      const img1 = imgElems[0]?.src || '';
      const img2 = imgElems[1]?.src || '';

      const date = el.querySelector('.item_top__0XTCV')?.textContent.trim() || 'Fecha desconocida';

      const result = el.querySelector('.parent_span__TxfTF div')?.textContent.trim() || '-';

      matchData.push({
        date,
        time,
        team1: {
          name: team1,
          image: img1
        },
        team2: {
          name: team2,
          image: img2
        },
        result
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

    await page.goto('https://www.promiedos.com.ar/league/premier-league/h', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    await delay(DELAY);

    const fecha1ButtonSelector = 'button.select-trigger_button__ZuHhB';
    const fechaButtons = await page.$$(fecha1ButtonSelector);

    for (const button of fechaButtons) {
      const buttonText = await page.evaluate(el => el.textContent.trim(), button);
      if (buttonText.startsWith('Fecha 1')) {
        await button.click();
        break;
      }
    }

    await delay(DELAY);

    for (let i = 1; i <= TOTAL_FECHAS; i++) {
      console.log(`Extrayendo partidos de Fecha ${i}`);

      const matches = await scrapeMatches(page);

      if (matches.length === 0) {
        console.warn(`No se encontraron partidos para la Fecha ${i}`);
      }

      const filename = path.join(OUTPUT_DIR, `fecha${i}.json`);
      fs.writeFileSync(filename, JSON.stringify(matches, null, 2), 'utf8');

      if (i < TOTAL_FECHAS) {
        const nextButtonSelector = 'button.select-trigger_chevron__VwFj9:last-child';
        const nextButton = await page.$(nextButtonSelector);

        if (nextButton) {
          await nextButton.click();
          await delay(DELAY);
          await page.waitForSelector('.item_item__BqOgz', { timeout: 60000 });
          await delay(DELAY);
        } else {
          console.log('Botón de siguiente fecha no encontrado. Finalizando.');
          break;
        }
      }
    }

    await browser.close();
    console.log('Todos los partidos se han guardado correctamente');

  } catch (error) {
    console.error('Error:', error);
  }
})();