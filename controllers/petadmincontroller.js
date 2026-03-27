const pet = require("../models/pets");

exports.managePet = async (req, res) => {
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

        return res.render("admin/pet/read", { pets, m: null, e: null, filters })
    } catch (e) {
        return res.render("error", { e: "Error loading pets" })
    }
}

exports.displayCreatePet = (req, res) => {
    return res.render("admin/pet/create", { m: null, e: null, filters: [] });
}

exports.createPet = async (req, res) => {
    const name = req.body.name;
    const species = req.body.species;
    const age = req.body.age;
    const ageUnit = req.body.ageUnit;
    const gender = req.body.gender;
    const weight = req.body.weight;
    let health = req.body.health;
    const status = req.body.status;
    const description = req.body.description;
    const imageURL = req.body.imageURL;

    //Health Logic
    if (!health) {
        health = "No known conditions"
    }

    let healthString = health

    if (Array.isArray(health)) {
        healthString = health.join(", ")
    }

    //Age Logic
    let ageUnitString = "";

    if (ageUnit === "year") {
        if (Number(age) === 1) {
            ageUnitString = "year old"
        } else {
            ageUnitString = "years old"
        }
    } else if (ageUnit === "month") {
        if (Number(age) > 11) {
            return res.render("admin/pet/create", { m: null, e: "Age in months must be less than 12; use years instead" });
        } else if (Number(age) === 1) {
            ageUnitString = "month old";
        } else {
            ageUnitString = "months old";
        }
    }

    const petData = {
        name,
        species,
        age: Number(age),
        ageUnit: ageUnitString,
        gender,
        weight: Number(weight),
        health: healthString,
        status,
        description,
        imageURL
    };

    try {
        await pet.createPet(petData);
        const pets = await pet.getAllPets();
        return res.render("admin/pet/read", { pets, m: `You have created pet named ${name} successfully!`, e: null, filters: [] });
    } catch (e) {
        return res.render("error", { m: null, e })
    }
}

exports.showUpdatePet = async (req, res) => {
    const pid = req.query.pid;

    if (!pid) {
        return res.render("error", { e: "Please select a pet!" });
    }

    try {
        const currentPet = await pet.getPetbyPID(pid);
        if (!currentPet) {
            return res.render("error", { e: "Pet not found" });
        }

        return res.render("admin/pet/update", { currentPet, m: null, e: null })
    } catch (e) {
        return res.render("error", { e: "Error loading pet" })
    }
}

exports.deletePet = async (req, res) => {
    const pid = req.query.pid;

    if (!pid) {
        return res.render("error", { e: "Please select a pet!" });
    }

    try {
        const currentPet = await pet.getPetbyPID(pid);
        await pet.deletePet(pid);
        
        const pets = await pet.getAllPets();
        return res.render("admin/pet/read", { pets, m: `You have deleted pet ${currentPet.name} successfully!`, e: null, filters: [] });
    } catch (e) {
        return res.render("error", { e: "Error deleting pet" });
    }
}

exports.handlePetAction = async (req, res) => {
    const action = req.query.action;

    if (action === "update") {
        return exports.showUpdatePet(req, res);
    }

    if (action === "delete") {
        return exports.deletePet(req, res);
    }

    return res.render("error", { e: "Invalid pet action. Please use update or delete." });
}

exports.updatePet = async (req, res) => {
    const pid = req.params.pid;
    const name = req.body.name;
    const species = req.body.species;
    const gender = req.body.gender;
    const age = req.body.age;
    const ageUnit = req.body.ageUnit;
    const weight = req.body.weight;
    let health = req.body.health;
    const status = req.body.status;
    const description = req.body.description;
    const imageURL = req.body.imageURL;
    const currentPet = await pet.getPetbyPID(pid);

    //Health Logic
    if (!health) {
        health = "No known conditions"
    }

    let healthString = health

    if (Array.isArray(health)) {
        healthString = health.join(", ")
    }

    //Age Logic
    let ageUnitString = "";

    if (ageUnit === "year") {
        if (Number(age) === 1) {
            ageUnitString = "year old"
        } else {
            ageUnitString = "years old"
        }
    } else if (ageUnit === "month") {
        if (Number(age) > 11) {
            return res.render("admin/pet/update", { currentPet, m: null, e: "Age in months must be less than 12; use years instead" });
        } else if (Number(age) === 1) {
            ageUnitString = "month old";
        } else {
            ageUnitString = "months old";
        }
    }

    if (!name || !species || !age || !weight || !status || !gender) {
        return res.render("admin/pet/update", { currentPet, m: null, e: "All required fields must be filled in" });
    }

    const petData = {
        name,
        species,
        age: Number(age),
        ageUnit: ageUnitString,
        gender,
        weight: Number(weight),
        health: healthString,
        status,
        description,
        imageURL
    };

    try {
        const updatedPet = await pet.updatePet(pid, petData)
        const pets = await pet.getAllPets();
        return res.render("admin/pet/read", { pets, m: `You have updated pet ${name} successfully!`, e: null, filters: [] });
    } catch (e) {
        return res.render("error", { e: "Error updating pet" })
    }
}
