const express = require('express');
const customercontroller = require('../controllers/customercontroller');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, customer, customercontroller.index);
router.get('/read', authenticated, customer, customercontroller.readaccount);
router.get('/update', authenticated, customer, customercontroller.updateview);

router.post('/update', authenticated, customer, customercontroller.updateaccount);

module.exports = router;
