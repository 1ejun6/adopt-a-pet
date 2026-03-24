const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    userid: {
        type:String,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: 18,
        max: 99
    },
    address: {
        type: String,
        required: [true, 'Home address is required'],
        trim: true
    },
    housingType: {
        type: String,
        enum: ['hdb', 'condo', 'landed', 'other'],
        required: [true, 'Housing type is required']
    },
    petType: {
        type: String,
        enum: ['dog', 'cat', 'any']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        trim: true
    },
    existingPets: {
        type: String,
        enum: ['yes', 'no']
    },
    allergies: {
        type: String,
        enum: ['yes', 'no']
    },
    commitments: {
        type: [String],  // array since checkboxes allow multiple selections
        enum: ['vet_visits', 'exercise', 'grooming', 'training']
    },
    nricDoc: {
        type: String  // stores the file path
    },
    supportingDocs: {
        type: String  // stores the file path
    },
    agreeTerms: {
        type: Boolean,
        required: [true, 'You must agree to the terms']
    },
    cdate: {
        type: Date,
        default: Date.now
    }
});

const Adoptions = mongoose.model('Adoptions', adoptionSchema, 'adoptions');

// METHODS
// CREATING FORM
exports.addForm = function (data) {
    Adoptions.create({
            fullName: data.fullName,
            userid: data.userid,
            email: data.email,
            phone: data.phone,
            age: data.age,
            address: data.address,
            housingType: data.housingType,
            petType: data.petType,
            reason: data.reason,
            existingPets: data.existingPets,
            allergies: data.allergies,
            commitments: data.commitments,
            nricDoc: data.nricDoc,
            supportingDocs: data.supportingDocs,
            agreeTerms: data.agreeTerms
            // cdate is auto-set by default: Date.now
        });
}

// READING FORM
exports.findByID = function(id) {
    return Adoptions.find({userid:id})
}

// UPDATE FORM
exports.updateForm = function(userid, data) {
    return Adoptions.updateOne({ userid: userid }, { $set: data }) //only update fields tht user specified, leave everything else unchanged
}


// DELETING FORM 
exports.deleteForm = function(id) {
    return Adoptions.deleteOne({ _id: id })
}