const pet = require("../models/pets");

exports.readPet = async (req, res) => {
    try {
        const pets = await pet.getAllPets();
        res.render("customer/pet/read", { pets })
    } catch (e) {
        res.render("error", { e })
    }
}