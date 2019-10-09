const express = require('express')
const db = require('./queries')
const app = express()
const port = 3000
const createError = require('http-errors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(new Date().getTime());
    next();
    return;
});

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/practises', db.getPractises);
app.get('/practises/:id', db.getPractiseById);
app.post('/practises', db.createPractise);
app.put('/practises/:id', db.updatePractise);
app.delete('/practises/:id', db.deletePractise);




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