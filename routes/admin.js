const express = require('express');
const admincontroller = require('../controllers/admincontroller');
const { authenticated, admin } = require('../middleware');

const router = express.Router();

router.get('/', authenticated, admin, admincontroller.dashboard);
router.get('/user', authenticated, admin, admincontroller.index);
router.get('/user/create', authenticated, admin, admincontroller.createview);
router.get('/user/update/:id', authenticated, admin, admincontroller.updateview);

router.post('/user/create', authenticated, admin, admincontroller.create);
router.post('/user/delete/:id', authenticated, admin, admincontroller.deleteaccounts);
router.post('/user/update/:id', authenticated, admin, admincontroller.saveupdate);

module.exports = router;
