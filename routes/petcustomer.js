const express = require('express');
const petcustomercontroller = require('../controllers/petcustomercontroller');
const { authenticated, customer, admin } = require('../middleware');

const router = express.Router();

//View Pet
router.get("/", authenticated, customer, petcustomercontroller.readPet)



module.exports = router;