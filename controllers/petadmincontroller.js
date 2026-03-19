const pet = require("../models/pets");

exports.managePet = async (req, res) => {
    try {
        const pets = await pet.getAllPets();

        return res.render("admin/manage-pet", { pets, m: null, e: null })
    } catch (e) {
        return res.render("error", { e: "Error loading pets" })
    }
}

exports.displayCreatePet = (req, res) => {
    return res.render("admin/create-pet", { m: null, e: null });
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
        return res.render("admin/manage-pet", { pets, m: "New pet created successfully!", e: null });
    } catch (e) {
        return res.render("error", { m: null, e: "Error creating pet" })
    }
}

exports.showUpdatePet = async (req, res) => {
    const pid = req.query.pid;

    if (!pid) {
        return res.render("error", { e: "Please select a pet!" });
    }

    try {
        const currentPet = await pet.getPetbyPID(Number(pid))
        return res.render("admin/update-pet", { currentPet, m: null, e: null })
    } catch (e) {
        return res.render("error", { e: "Error loading pet" })
    }
}

exports.handleUpdateDeletePet = async (req, res) => {
    const pid = req.query.pid;
    const action = req.query.action;

    if (!pid) {
        return res.render("error", { e: "Please select a pet!" });
    }

    if (action === 'delete') {
        try {
            await pet.deletePet(pid);
            const pets = await pet.getAllPets();
            return res.render("admin/manage-pet", { pets, m: "Pet deleted successfully!", e: null });
        } catch (e) {
            return res.render("error", { e: "Error deleting pet" });
        }
    }

    try {
        const currentPet = await pet.getPetbyPID(Number(pid));
        if (!currentPet) {
            return res.render("error", { e: "Pet not found" });
        }

        return res.render(`admin/update-pet`, { currentPet, m: null, e: null })

    } catch (e) {
        return res.render("error", { e: "Error loading pet" })
    }
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
        return res.render("admin/update-pet", { currentPet, m: null, e: "All required fields must be filled in" });
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
        return res.render("admin/manage-pet", { pets, m: "Pet updated successfully!", e: null });
    } catch (e) {
        return res.render("error", { e: "Error updating pet" })
    }
}
