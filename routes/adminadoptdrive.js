const express = require('express');
const adoptdriveadmincontroller = require('../controllers/adoptdriveadmincontroller');
const { authenticated, admin } = require('../middleware');

const router = express.Router();

// show all drives
router.get('/', authenticated, admin, adoptdriveadmincontroller.getadminalldrives);

// show create form
router.get('/create', authenticated, admin, adoptdriveadmincontroller.getadmincreateform);

// create drive
router.post('/create', authenticated, admin, adoptdriveadmincontroller.createadmindrive);

// show edit form
router.get('/:id/edit', authenticated, admin, adoptdriveadmincontroller.getadmineditform);

// update drive
router.post('/:id/edit', authenticated, admin, adoptdriveadmincontroller.updateadmindrive);

// delete drive
router.post('/:id/delete', authenticated, admin, adoptdriveadmincontroller.deleteadmindrive);

module.exports = router;