const express = require('express');
const router = express.Router();
const db = require('../models/queries')


router.get('/practises', db.getPractises);
router.get('/practises/:id', db.getPractiseById);
router.get('/userExists', db.userExists);
router.post('/practises', db.createPractise);
router.post('/createUser', db.createUser);
router.put('/practises/:id', db.updatePractise);
router.delete('/practises/:id', db.deletePractise);

module.exports = router;