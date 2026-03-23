const express = require('express');
const guestadoptdrivecontroller = require('../controllers/guestadoptdrivecontroller');

const router = express.Router();

// GET /adoption-drives (public page)
router.get('/', guestadoptdrivecontroller.getguestalldrives);

module.exports = router;