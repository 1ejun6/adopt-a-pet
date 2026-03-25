const express = require('express');
const adoptdrivecustomercontroller = require('../controllers/adoptdrivecustomercontroller');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, customer, adoptdrivecustomercontroller.getcustomeralldrives);

module.exports = router;