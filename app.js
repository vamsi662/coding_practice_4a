const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started Successfully...')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

intializeDbAndServer()

// GET players API

app.get('/players/', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id`
  const playerArray = await db.all(getPlayersQuery)
  response.send(
    playerArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

// POST player API

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES('${playerName}',${jerseyNumber},'${role}')`
  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

// GET player API

app.get('/players/:playerId', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    }
  }
  const {playerId} = request.params
  const playerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`
  const playerDetails = await db.get(playerQuery)
  response.send(
    playerDetails.map(eachPlayer =>
      convertDbObjectToResponseObject(eachPlayer),
    ),
  )
})

// PUT player API

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `UPDATE cricket_team SET player_name = '${playerName}',jersey_number = ${jerseyNumber},role = '${role}' WHERE player_id = ${playerId}`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

// DELETE player API

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
