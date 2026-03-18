const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
    {
        pid : {
            type : Number,
            required : true,
            unique : true,
        },
        name : {
            type : String,
            required : true,
        },
        species : {
            type : String,
            required : true,
        },
        age : {
            type : Number,
            required : true,
        },
        weight : {
            type : Number,
            required : true,
        },
        health : {
            type : String,
            required : true,
        },
        status : {
            type : String,
            required : true,
        },
        description : {
            type : String,
        },
        imageURL : {
            type : String,
        }

    }
)

const Pet = mongoose.model("Pet", petSchema, "pets");

//Create
exports.createPet = (pet) => {
    return Pet.create(pet);
}

//Read
exports.getAllPets = () => {
    return Pet.find();
}

//Update
exports.updatePet = (pid, petData) => {
    return Pet.updateOne({pid}, petData);
}

//Delete
exports.deletePet = (pid) => {
    return Pet.deleteOne({ pid });
}

//Get Pet by PID

exports.getPetbyPID = (pid) => {
    return Pet.findOne({ pid });
}