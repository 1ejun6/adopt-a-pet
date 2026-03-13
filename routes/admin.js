const express = require('express');
const admincontroller = require('../controllers/admincontroller');
const { authenticated, admin } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, admin, admincontroller.index);
router.get('/create', authenticated, admin, admincontroller.createview);

router.post('/create', authenticated, admin, admincontroller.create);
router.post('/delete', authenticated, admin, admincontroller.deleteaccounts);
router.post('/update', authenticated, admin, admincontroller.selectupdate);
router.post('/update/:id', authenticated, admin, admincontroller.saveupdate);

module.exports = router;
