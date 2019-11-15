const express = require('express')
const session = require('express-session');
const app = express()
const port = 3000
const httpsPort = 8443;
const createError = require('http-errors');
const logger = require('morgan');
//const cors = require('cors')
const fs = require('fs');

const indexRouter = require('./routes/CRUD');
const CRUDoperationsRouter = require('./routes/index');

//const router = express.Router();

const https = require('https');
const privateKey  = fs.readFileSync('./certs/localhost.key', 'utf8');
const certificate = fs.readFileSync('./certs/localhost.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cors({credentials: true, origin: 'http://localhost:4200', methods: "GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS"}) // origin: true, 
//app.use(cors());
app.use(session({resave: false, saveUninitialized: true, 
    secret: 'XCR3rsasa%RDHHHAA', cookie: { maxAge: 1000 * 60 * 30 }}));  // 10 * 1000 is 10 sec

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


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

const httpsServer = https.createServer(credentials, app);

/*
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});
*/


httpsServer.listen(httpsPort, () => {
    console.log(`App running on port ${httpsPort}.`)

});


module.exports = app;