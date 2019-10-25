const createError = require('http-errors');
const { sanitizeBody, body, validationResult, param } = require('express-validator');
const fetch = require("node-fetch");

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rest',
  password: 'admin',
  port: 5432,
})

async function isValidAuthentication(query, session) {
  if(session.token === undefined) {
    const token = query.token;
    let response = await fetch('http://api.github.com/user', {
			headers: {
				// Include the token in the Authorization header
				Authorization: 'token ' + token
			}
    });
    response = await response.json();
    if(response.id !== undefined) {
      session.token = "OK"
      return true;
    } else {
      session.token = undefined;
      return false;
    }    
  }
  else if(session.token === "OK") {
    return true;
  }
  else {
    return false;
  }
}

async function getUserIdinformation(access_token) {
    let response = await fetch('http://api.github.com/user', {
			headers: {
				// Include the token in the Authorization header
				Authorization: 'token ' + access_token
			}
    });
    response = await response.json();
    return response;
}

const userExists = [
  param('token', 'token does not exist').exists(),
  param('token', 'token is too short').isLength({ min: 40 }),
  (request, response, next) => {
  isValidAuthentication(request.query, request.session).then(authorized => {
    if(authorized) {
      const userInfo = getUserIdinformation(request.query.token);
      userInfo.then(info => {
        pool.query('SELECT id FROM users WHERE id = $1', [info.id], (error, results) => {
          if (error) {
            next(createError(500));
            throw error
          }
          if(Array.isArray(results.rows) && results.rows.length) {
            return response.status(200).json({"userExists": true})
          } else {
            return response.status(200).json({"userExists": false})
          }
        })
      }
    )
    .catch(err => console.error(err));
    }
    else {
      return response.status(401).json({error: "not authorized"});
    }
  })  
}
];

const createUser = [
  
  body('userId', 'userId field is required').exists(),
  body('userId', 'min length is 10').isLength({ min: 40 }),
  
  (request, response, next) => {
    isValidAuthentication(request.query, request.session).then(authorized => {
      if(authorized) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          response.json( { errors: errors.array() });
          return;
        }
        const { userId } = request.body
        const userInfo = getUserIdinformation(userId);

        userInfo.then(info => {
          pool.query('INSERT INTO users (id, nick_name) VALUES ($1, $2) RETURNING id',
          [info.id, info.login],
          (error, results) => {
            if (error) {
              next(createError(500));
              throw error
            }        
            response.status(201).json({id:results.rows[0].id})
          })
          })
          .catch(err => console.error(err));
        } else {
          return response.status(401).json({error: "not authorized"});
        }       
    })
  }
];

getPractises = (request, response, next) => {
  isValidAuthentication(request.query, request.session).then(authorized => {
    if(authorized) {
      const userInfo = getUserIdinformation(request.query.token);
      userInfo.then(info => {
        pool.query('SELECT id, SUBSTRING(date::varchar FROM 1 FOR 10) as date, title, description FROM practises WHERE user_id = $1 ORDER BY date DESC',
        [info.id],
        (error, results) => {
        if (error) {
          next(createError(500));
          throw error
        }
        return response.status(200).json(results.rows)
      })
      })
      .catch(err => console.error(err));      
    }
    else {
      return response.status(401).json({error: "not authorized"});
    }
  })  
}


const getPractiseById = [
  param('id', 'id does not exist').exists(),
  param('id', 'too short id').isLength({ min: 1 }),
  param('id', 'is not integer').isInt(),

  sanitizeBody('id').escape(),
  (request, response, next) => {
    isValidAuthentication(request.query, request.session).then(authorized => {
      if(authorized) {
        const errors = validationResult(request);        
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          response.json( { errors: errors.array() } );
          return;
        }
        const userInfo = getUserIdinformation(request.query.token);
        userInfo.then(info => {
          const id = parseInt(request.params.id)
          pool.query('SELECT * FROM practises WHERE id = $1 AND user_id = $2', 
          [id, info.id], (error, results) => {
            if (error) {
              next(createError(500));
              throw error
            }
            if(results.rowCount < 1) {
              return response.status(404).json( {error:`No practises found with provided id (${id})`} );
            } 
            response.status(200).json(results.rows)
          })
        })
        .catch(err => console.error(err));
      } else {
        return response.status(401).json({error: "not authorized"});
      }
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
    isValidAuthentication(request.query, request.session).then(authorized => {
      if(authorized) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          response.json( { errors: errors.array() });
          return;
        }
        const userInfo = getUserIdinformation(request.query.token);
        userInfo.then(info => {
          const { description, date, title } = request.body
          pool.query('INSERT INTO practises (description, date, title, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
          [description, date, title, info.id],
          (error, results) => {
            if (error) {
              next(createError(500));
              throw error
            }        
            response.status(201).json({id:results.rows[0].id})
          })
        })
      .catch(err => console.error(err));
      } else {
        return response.status(401).json({error: "not authorized"});
      }
    
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
    isValidAuthentication(request.query, request.session).then(authorized => {
      if(authorized) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          response.json( { errors: errors.array() });
          return;
        }

        const userInfo = getUserIdinformation(request.query.token);
        userInfo.then(info => {
          const id = parseInt(request.params.id)
          const { description, date, title } = request.body

          pool.query(
            'UPDATE practises SET description = $1, date = $2, title = $3 WHERE id = $4 AND user_id = $5',
            [description, date, title, id, info.id],
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
        })
        .catch(err => console.error(err));
      } else {
          return response.status(401).json({error: "not authorized"});
        }  
    })
  }
];

const deletePractise = [    
  param('id', 'id does not exist').exists(),
  param('id', 'too short id').isLength({ min: 1 }),
  param('id', 'is not integer').isInt(),
  
  sanitizeBody('id').escape(),
  
  (request, response, next) => {
    isValidAuthentication(request.query, request.session).then(authorized => {
      if(authorized) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          response.json( { errors: errors.array() });
          return;
        }
        const userInfo = getUserIdinformation(request.query.token);
        userInfo.then(info => {
          const id = parseInt(request.params.id)
          pool.query('DELETE FROM practises WHERE id = $1 AND user_id = $2 RETURNING id',
           [id, info.id], (error, results) => {
            if (error) {
              next(createError(500));
              throw error
            }
            if(Array.isArray(results.rows) && results.rows.length) {
              return response.status(200).json({id: results.rows[0].id});
            }      
            response.status(404).json({error: `no practises with id: ${id}`});
          })
        })
        .catch(err => console.error(err));
      } else {
        return response.status(401).json({error: "not authorized"});
      }    
    })
  }
];

module.exports = {
  getPractises,
  getPractiseById,
  createPractise,
  updatePractise,
  deletePractise,
  userExists,
  createUser
}

/*
CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  nick_name varchar(80)
);

CREATE TABLE practises (
  ID SERIAL PRIMARY KEY,
  user_id SERIAL references users(ID),
  date DATE,
  title varchar,
  description TEXT
);
*/