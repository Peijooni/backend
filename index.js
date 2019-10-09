const express = require('express')
const app = express()
const port = 3000
const createError = require('http-errors');
const logger = require('morgan');

const indexRouter = require('./routes/CRUD');
const CRUDoperationsRouter = require('./routes/index');

//const router = express.Router();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/', CRUDoperationsRouter);


app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error: ' + err.status + ' ' + err.message);
});




/*
// Keep this last!
app.use(function(req, res){
    res.status(404).send('404 error');
  });
*/


app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});

module.exports = app;