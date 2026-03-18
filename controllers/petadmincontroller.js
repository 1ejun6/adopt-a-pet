const pet = require("../models/pets");

exports.managePet = async (req, res) => {
    try {
        const pets = await pet.getAllPets();

        res.render("admin/manage-pet", { pets })
    } catch (e) {
        res.render("error", { e })
    }
}

exports.displayCreatePet = (req, res) => {
    return res.render("admin/create-pet", {} );
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
        res.send(`
            New pet created successfully!
            <br>
            <a href="/pet/admin">View all the pets</a>
            `);
    } catch (e) {
        res.render("error", { e })
    }
}

exports.showUpdatePet = async (req, res) => {
    const pid = req.query.pid;

    if (!pid) {
        return res.send(
            `Missing pet ID!`
        )
    }

    try {
        const currentPet = await pet.getPetbyPID(Number(pid))
        return res.render("admin/update-pet", { currentPet })
    } catch (e) {
        res.render("error", { e })
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
        return res.render("admin/update-pet", { currentPet });
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
        res.send(`
            Pet updated successfully!<br>
            <a href="/pet/admin">View all the pets</a>
            `)
    } catch (e) {
        res.render("error", { e })
    }
}

exports.showDeletePet = async (req, res) => {
    try {
        const pets = await pet.getAllPets();

        res.render("admin/delete-pet", { pets })
    } catch (e) {
        res.render("error", { e })
    }
}

exports.deletePet = async (req, res) => {
    const pid = req.body.pid;
    
    try {
        await pet.deletePet(pid);
        res.send(`Pet deleted successfully!<br>
            <a href="/pet/admin">View all the pets</a>
            `)
    } catch (e) {
        res.render("error", { e })
    }
}
