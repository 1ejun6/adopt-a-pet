const express = require('express');
const adminadoptdrivecontroller = require('../controllers/adminadoptdrivecontroller');
const { authenticated, admin } = require('../middleware');

const router = express.Router();

// show all drives
router.get('/', authenticated, admin, adminadoptdrivecontroller.getadminalldrives);

// show create form
router.get('/create', authenticated, admin, adminadoptdrivecontroller.getadmincreateform);

// create drive
router.post('/create', authenticated, admin, adminadoptdrivecontroller.createadmindrive);

// show edit form
router.get('/:id/edit', authenticated, admin, adminadoptdrivecontroller.getadmineditform);

// update drive
router.post('/:id/edit', authenticated, admin, adminadoptdrivecontroller.updateadmindrive);

// delete drive
router.post('/:id/delete', authenticated, admin, adminadoptdrivecontroller.deleteadmindrive);

module.exports = router;