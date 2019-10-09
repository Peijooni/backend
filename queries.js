const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rest',
  password: 'admin',
  port: 5432,
})

const getPractises = (request, response, next) => {
  pool.query('SELECT * FROM practises ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getPractiseById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM practises WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createPractise = (request, response) => {
  const { practise, time } = request.body

  pool.query('INSERT INTO practises (practise, time) VALUES ($1, $2) RETURNING id', [practise, time],
   (error, results) => {
    if (error) {
      throw error
    }
    
    response.status(201).send(`User added with ID: ${results.rows[0].id}`)
  })
}

const updatePractise = (request, response) => {
  const id = parseInt(request.params.id)
  const { practise, time } = request.body

  pool.query(
    'UPDATE practises SET practise = $1, time = $2 WHERE id = $3',
    [practise, time, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deletePractise = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM practises WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
  getPractises,
  getPractiseById,
  createPractise,
  updatePractise,
  deletePractise,
}

/*
CREATE TABLE practises (
  ID SERIAL PRIMARY KEY,
  time TIMESTAMP,
  practise TEXT
);
*/