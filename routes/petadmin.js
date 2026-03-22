const express = require('express');
const petadmincontroller = require('../controllers/petadmincontroller');
const { authenticated, admin } = require('../middleware');

const router = express.Router();

//View Pet/Manage Pet
router.get("/", authenticated, admin, petadmincontroller.managePet);

//Creation of Pet
router.get("/create", authenticated, admin, petadmincontroller.displayCreatePet);
router.post("/create", authenticated, admin, petadmincontroller.createPet);

//Update and Delete Pet
router.get("/action", authenticated, admin, petadmincontroller.handlePetAction);
router.post("/update/:pid", authenticated, admin, petadmincontroller.updatePet);

module.exports = router;