const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
    {
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
        gender: {
            type : String,
            required : true
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
exports.updatePet = (_id, petData) => {
    return Pet.updateOne({_id}, petData);
}

//Delete
exports.deletePet = (_id) => {
    return Pet.deleteOne({ _id });
}

//Get Pet by PID

exports.getPetbyPID = (_id) => {
    return Pet.findOne({ _id });
}