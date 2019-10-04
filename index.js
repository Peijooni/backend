const express = require('express')
const db = require('./queries')
const app = express()
const port = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/practises', db.getPractises);
app.get('/practises/:id', db.getPractiseById);
app.post('/practises', db.createPractise);
app.put('/practises/:id', db.updatePractise);
app.delete('/practises/:id', db.deletePractise);



app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});