const pet = require("../models/pets");

exports.readPet = async (req, res) => {
    try {
        const filters = req.query;

        const mongoQuery = {};

        if (filters.search) {
            mongoQuery.name = { $regex: filters.search, $options: 'i' };
        }

        if (filters.species) {
            mongoQuery.species = filters.species;
        }

        if (filters.age === 'Juniors') {
            mongoQuery.age = { $lt: 1 };
        }

        else if (filters.age === 'Young') {
            mongoQuery.age = { $gte: 1, $lt: 4 };
        }

        else if (filters.age === 'Adult') {
             mongoQuery.age = { $gte: 4, $lt: 8 };
        }

        else if (filters.age === 'Senior') {
            mongoQuery.age = { $gte: 8 };
        }

        if (filters.gender) {
            mongoQuery.gender = filters.gender;
        }

        const pets = await pet.getAllPets({ query: mongoQuery });

        return res.render("customer/pet/read", { pets, m: null, e: null, filters })
    } catch (e) {
        return res.render("error", { e: "Error loading pets" })
    }
}