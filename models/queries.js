const createError = require('http-errors');
const { sanitizeBody, body, validationResult, param } = require('express-validator');

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
      next(createError(500));
      throw error
    }
    response.status(200).json(results.rows)
  })
}


const getPractiseById = [
  param('id', 'id does not exist').exists(),
  param('id', 'too short id').isLength({ min: 1 }),
  param('id', 'is not integer').isInt(),

  sanitizeBody('id').escape(),
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      response.json( { errors: errors.array() });
      return;
    }
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM practises WHERE id = $1', [id], (error, results) => {
      if (error) {
        next(createError(500));
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
];


const createPractise = [
  
  body('practise', 'practise field is required').exists(),
  body('practise', 'min length is 5').isLength({ min: 5 }),

  body('time', 'time field is required').exists(),
  body('time', 'not in right date-format').isISO8601(),

  sanitizeBody('time').toDate(),
  
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      response.json( { errors: errors.array() });
      return;
    }
    const { practise, time } = request.body

    pool.query('INSERT INTO practises (practise, time) VALUES ($1, $2) RETURNING id', [practise, time],
    (error, results) => {
      if (error) {
        next(createError(500));
        throw error
      }
      
      response.status(201).send(`Practise added with ID: ${results.rows[0].id}`)
    })
  }
];

const updatePractise = [    
  param('id', 'id does not exist').exists(),
  param('id', 'too short id').isLength({ min: 1 }),
  param('id', 'is not integer').isInt(),

  body('practise', 'practise field is required').exists(),
  body('practise', 'min length is 5').isLength({ min: 5 }),

  body('time', 'time field is required').exists(),
  body('time', 'not in right date-format').isISO8601(),

  sanitizeBody('time').toDate(),
  sanitizeBody('id').escape(),
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      response.json( { errors: errors.array() });
      return;
    }

    const id = parseInt(request.params.id)
    const { practise, time } = request.body

    pool.query(
      'UPDATE practises SET practise = $1, time = $2 WHERE id = $3',
      [practise, time, id],
      (error, results) => {
        if (error) {
          next(createError(500));
          throw error
        }
        console.log(results);
        response.status(200).send(`Tried to modify practise with ID: ${id}. 
            Modified ${results.rowCount} practises`)
      }
    )
  }
];

const deletePractise = [    
  param('id', 'id does not exist').exists(),
  param('id', 'too short id').isLength({ min: 1 }),
  param('id', 'is not integer').isInt(),
  
  sanitizeBody('id').escape(),
  
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      response.json( { errors: errors.array() });
      return;
    }
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM practises WHERE id = $1', [id], (error, results) => {
      if (error) {
        next(createError(500));
        throw error
      }
      console.log(results);
      response.status(200).send(`Tried to delete practise with ID: ${id}. Deleted ${results.rowCount} rows.`)
    })
  }
];

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