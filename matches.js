import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_DIR = 'matches_dates';
const formatDate = (date) => {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
};

if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR);
}

async function scrapeMatches() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const DATE = formatDate(new Date());
    await page.goto(`https://www.promiedos.com.ar/games/${DATE}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pageDate = await page.evaluate(() => {
      const dateEl = document.querySelector('.calendario-bottom_title__9ogZ8 h3');
      if (!dateEl) return null;
      const [_, date] = dateEl.textContent.split(',');
      return date.trim();
    });

    const [day, month] = pageDate.split(' de ');
    const dateFolder = `${day.padStart(2, '0')}-${month.substring(0, 2)}`;
    
    const OUTPUT_DIR = path.join(BASE_DIR, dateFolder);
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }

    await page.waitForSelector('.item_item__BqOgz', { timeout: 30000 });

    const matches = await page.evaluate((currentDate) => {
      const matchElements = document.querySelectorAll('.item_item__BqOgz');
      const matchData = [];

      matchElements.forEach(match => {
        const leagueElement = match.closest('.match-info_itemevent__jJv13');
        const leagueName = leagueElement?.querySelector('.event-header_left__q8kgh')?.textContent?.trim();
        
        const homeTeam = match.querySelector('.team_left__S_a4n .command_title__sMlhS')?.textContent?.trim();
        const awayTeam = match.querySelector('.team_right__ePX7C .command_title__sMlhS')?.textContent?.trim();
        
        const homeTeamImg = match.querySelector('.team_left__S_a4n img.team')?.src;
        const awayTeamImg = match.querySelector('.team_right__ePX7C img.team')?.src;
        
        const time = match.querySelector('.time_time__GlBIn')?.textContent?.trim();
        const liveTime = match.querySelector('.time_live__R_P2p')?.textContent?.trim();
        
        const homeScore = match.querySelector('.result_number__14zEM:first-child span')?.textContent?.trim();
        const awayScore = match.querySelector('.result_number__14zEM:last-child span')?.textContent?.trim();

        const tvNetwork = match.querySelector('.time_block__4qwyy img')?.alt;
        
        matchData.push({
          league: leagueName,
          homeTeam,
          homeTeamImg,
          awayTeam,
          awayTeamImg,
          time: time || liveTime,
          score: homeScore && awayScore ? `${homeScore}-${awayScore}` : null,
          status: liveTime ? 'LIVE' : 'SCHEDULED',
          date: currentDate,
          tvNetwork: tvNetwork || null
        });
      });

      return matchData;
    }, pageDate);

    const matchesByLeague = matches.reduce((acc, match) => {
      if (!acc[match.league]) {
        acc[match.league] = [];
      }
      acc[match.league].push(match);
      return acc;
    }, {});

    const fileName = `matches.json`;
    fs.writeFileSync(
      path.join(OUTPUT_DIR, fileName),
      JSON.stringify(matchesByLeague, null, 2)
    );

    console.log(`Matches saved to ${path.join(OUTPUT_DIR, fileName)}`);

  } catch (error) {
    console.error('Error scraping matches:', error);
  } finally {
    await browser.close();
  }
}

scrapeMatches();