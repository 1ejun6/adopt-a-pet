const mongoose = require('mongoose');

// ======================= to replace? =====================
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
        ageUnit : {
            type : String,
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

exports.getAllSpecies = () =>  {
    return Pet.distinct('species');
}

exports.findPetsBySpecies = (species) => {
    return Pet.find({ species })
}