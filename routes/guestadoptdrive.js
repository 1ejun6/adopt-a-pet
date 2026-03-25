const express = require('express');
const adoptdriveguestcontroller = require('../controllers/adoptdriveguestcontroller');

const router = express.Router();

// GET /adoption-drives (public page)
router.get('/', adoptdriveguestcontroller.getguestalldrives);

module.exports = router;