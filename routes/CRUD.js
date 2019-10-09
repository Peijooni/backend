const express = require('express');
const router = express.Router();
const db = require('../models/queries')

router.get('/practises', db.getPractises);
router.get('/practises/:id', db.getPractiseById);
router.post('/practises', db.createPractise);
router.put('/practises/:id', db.updatePractise);
router.delete('/practises/:id', db.deletePractise);

module.exports = router;