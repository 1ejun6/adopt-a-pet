const express = require('express');
const customeradoptdrivecontroller = require('../controllers/customeradoptdrivecontroller');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, customer, customeradoptdrivecontroller.getcustomeralldrives);

module.exports = router;