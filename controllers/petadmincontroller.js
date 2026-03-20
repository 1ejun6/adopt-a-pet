const pet = require("../models/pets");

exports.managePet = async (req, res) => {
    try {
        const pets = await pet.getAllPets();

        return res.render("admin/pet/read", { pets, m: null, e: null })
    } catch (e) {
        return res.render("error", { e: "Error loading pets" })
    }
}

exports.displayCreatePet = (req, res) => {
    return res.render("admin/pet/create", { m: null, e: null });
}

exports.createPet = async (req, res) => {
    const pid = req.body.pid;
    const name = req.body.name;
    const species = req.body.species;
    const age = req.body.age;
    const weight = req.body.weight;
    const health = req.body.health;
    const status = req.body.status;
    const description = req.body.description;
    const imageURL = req.body.imageURL;

    const petData = {
        pid: Number(pid),
        name,
        species,
        age: Number(age),
        weight: Number(weight),
        health,
        status,
        description,
        imageURL
    };

    try {
        await pet.createPet(petData);
        const pets = await pet.getAllPets();
        return res.render("admin/pet/read", { pets, m: "New pet created successfully!", e: null });
    } catch (e) {
        return res.render("error", { m: null, e: "Error creating pet" })
    }
}

exports.showUpdatePet = async (req, res) => {
    const pid = Number(req.query.pid);

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
    const pid = Number(req.query.pid);

    if (!pid) {
        return res.render("error", { e: "Please select a pet!" });
    }

    try {
        await pet.deletePet(pid);
        const pets = await pet.getAllPets();
        return res.render("admin/pet/read", { pets, m: "Pet deleted successfully!", e: null });
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
    const pid = req.body.pid;
    const name = req.body.name;
    const species = req.body.species;
    const age = req.body.age;
    const weight = req.body.weight;
    const health = req.body.health;
    const status = req.body.status;
    const description = req.body.description;
    const imageURL = req.body.imageURL;

    if (!name || !species || !age || !weight || !health || !status) {
        const currentPet = await pet.getPetbyPID(pid);
        return res.render("admin/pet/update", { currentPet, m: null, e: "All required fields must be filled in" });
    }

    const petData = {
        name,
        species,
        age: Number(age),
        weight: Number(weight),
        health,
        status,
        description,
        imageURL
    };

    try {
        const updatedPet = await pet.updatePet(Number(pid), petData)
        const pets = await pet.getAllPets();
        return res.render("admin/pet/read", { pets, m: "Pet updated successfully!", e: null });
    } catch (e) {
        return res.render("error", { e: "Error updating pet" })
    }
}
