const express = require('express');
const customercontroller = require('../controllers/customercontroller');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, customer, customercontroller.dashboard);
router.get('/user/read', authenticated, customer, customercontroller.readaccount);
router.get('/user/update', authenticated, customer, customercontroller.updateview);

router.post('/user/update', authenticated, customer, customercontroller.updateaccount);

module.exports = router;
