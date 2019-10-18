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
  pool.query('SELECT id, SUBSTRING(date::varchar FROM 1 FOR 10) as date, title, description FROM practises ORDER BY id ASC', (error, results) => {
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
  
  body('title', 'practise field is required').exists(),

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
    const { description, date, title } = request.body

    pool.query('INSERT INTO practises (description, date, title) VALUES ($1, $2, $3) RETURNING id',
     [description, date, title],
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

  body('title', 'practise field is required').exists(),

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
    const { description, date, title } = request.body

    pool.query(
      'UPDATE practises SET description = $1, date = $2, title = $3 WHERE id = $4',
      [description, date, title, id],
      (error, results) => {
        if (error) {
          next(createError(500));
          throw error
        }
        if(results.rowCount < 1) {
          return response.status(404).json( {error:`No practises found with provided id (${id})`} );
        } 
        response.status(200).json( { id: id} )
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

    pool.query('DELETE FROM practises WHERE id = $1  RETURNING id', [id], (error, results) => {
      if (error) {
        next(createError(500));
        throw error
      }
      if(Array.isArray(results.rows) && results.rows.length) {
        return response.status(200).json({id: results.rows[0].id});
      }      
      response.status(404).json({error: `no practises with id: ${id}`});
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
  date DATE,
  title varchar,
  description TEXT
);
*/