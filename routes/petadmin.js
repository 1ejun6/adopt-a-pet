const express = require('express');
const petadmincontroller = require('../controllers/petadmincontroller');
const { authenticated, customer, admin } = require('../middleware');

const router = express.Router();

//View Pet/Manage Pet
router.get("/", authenticated, admin, petadmincontroller.managePet);

//Creation of Pet
router.get("/create-pet", authenticated, admin, petadmincontroller.displayCreatePet);
router.post("/create-pet", authenticated, admin, petadmincontroller.createPet);

//Update Pet
router.get("/update-pet", authenticated, admin, petadmincontroller.showUpdatePet);
router.post("/update-pet", authenticated, admin, petadmincontroller.updatePet);

//Delete Pet
router.get("/delete-pet", authenticated, admin, petadmincontroller.showDeletePet);
router.post("/delete-pet", authenticated, admin, petadmincontroller.deletePet);


module.exports = router;