const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
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
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pets',
        required: [true, 'Preferred pet is required']
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

module.exports = mongoose.model('adoptions', adoptionSchema);