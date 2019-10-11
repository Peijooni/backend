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
  
  body('description', 'practise field is required').exists(),
  body('description', 'min length is 5').isLength({ min: 5 }),

  body('date', 'time field is required').exists(),
  body('date', 'not in right date-format').isISO8601(),

  sanitizeBody('date').toDate(),
  
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      response.json( { errors: errors.array() });
      return;
    }
    const { description, date } = request.body

    pool.query('INSERT INTO practises (description, date) VALUES ($1, $2) RETURNING id',
     [description, date],
    (error, results) => {
      if (error) {
        next(createError(500));
        throw error
      }
      
      response.status(201).json({id:results.rows[0].id})
    })
  }
];

const updatePractise = [    
  param('id', 'id does not exist').exists(),
  param('id', 'too short id').isLength({ min: 1 }),
  param('id', 'is not integer').isInt(),

  body('description', 'practise field is required').exists(),
  body('description', 'min length is 5').isLength({ min: 5 }),

  body('date', 'time field is required').exists(),
  body('date', 'not in right date-format').isISO8601(),

  sanitizeBody('date').toDate(),
  sanitizeBody('id').escape(),
  (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      response.json( { errors: errors.array() });
      return;
    }

    const id = parseInt(request.params.id)
    const { description, date } = request.body

    pool.query(
      'UPDATE practises SET description = $1, date = $2 WHERE id = $3',
      [description, date, id],
      (error, results) => {
        if (error) {
          next(createError(500));
          throw error
        }
        // Tässä on ongelma!!
        if(results.rowCount < 1) {
          return response.status(202).send(`No practises found with provided id (${id})`);
        } 
        response.status(200).send(`Modified ${results.rowCount} practises with ID: ${id}.`)
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
  date TIMESTAMP,
  description TEXT
);
*/