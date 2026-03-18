const express = require('express');
const petadmincontroller = require('../controllers/petadmincontroller');
const { authenticated, customer, admin } = require('../middleware');

const router = express.Router();

//View Pet/Manage Pet
router.get("/", authenticated, admin, petadmincontroller.managePet);

//Creation of Pet
router.get("/create-pet", authenticated, admin, petadmincontroller.displayCreatePet);
router.post("/create-pet", authenticated, admin, petadmincontroller.createPet);

//Update and Delete Pet
router.get("/update-pet", authenticated, admin, petadmincontroller.handleUpdateDeletePet);
router.post("/update-pet", authenticated, admin, petadmincontroller.updatePet);

module.exports = router;