const mongoose = require('mongoose');

// ======================= to replace? =====================
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

exports.getAllSpecies = () =>  {
    return Pet.distinct('species');
}