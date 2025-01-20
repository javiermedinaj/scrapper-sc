import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return null
  }
}

app.get('/api/premier/table', (req, res) => {
  const tableData = readJsonFile(path.join(__dirname, 'matches_premier/table_position/table_position.json'))
  res.json(tableData)
})

app.get('/api/premier/matches', (req, res) => {
  const { matchday } = req.query;
  
  // If matchday is specified, return specific matchday
  if (matchday) {
    const matchData = readJsonFile(path.join(__dirname, `matches_premier/fecha${matchday}.json`))
    if (!matchData) {
      return res.status(404).json({ error: 'Matchday not found' })
    }
    return res.json(matchData)
  }

  const allMatches = [];
  for (let i = 1; i <= 38; i++) {
    const matchData = readJsonFile(path.join(__dirname, `matches_premier/fecha${i}.json`))
    if (matchData) {
      allMatches.push({
        matchday: i,
        matches: matchData
      })
    }
  }

  res.json(allMatches)
})

app.get('/api/premier/matchdays', (req, res) => {
  const matchdays = [];
  for (let i = 1; i <= 38; i++) {
    const filepath = path.join(__dirname, `matches_premier/fecha${i}.json`)
    if (fs.existsSync(filepath)) {
      matchdays.push(i)
    }
  }
  res.json(matchdays)
})

app.get('/api/argentina/round/:roundNumber', (req, res) => {
  const { roundNumber } = req.params
  const roundData = readJsonFile(path.join(__dirname, `matches_arg/round_${roundNumber}.json`))
  
  if (!roundData) {
    return res.status(404).json({ error: 'Round not found' })
  }
  res.json(roundData)
})

app.get('/api/argentina/rounds', (req, res) => {
  const rounds = []
  for (let i = 1; i <= 16; i++) {
    const filepath = path.join(__dirname, `matches_arg/round_${i}.json`)
    if (fs.existsSync(filepath)) {
      rounds.push(i)
    }
  }
  res.json(rounds)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})