const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
    uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
    },
    pid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pets',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    housingtype: {
        type: String,
        enum: ['hdb', 'condo', 'landed', 'other'],
        required: [true, 'Housing type is required']
    },
    experience: {
        type: String,
        required: [true, 'Please state your experience']
    },
    reasonforadoption: {
        type: String,
        required: [true, 'Reason is required']
    },
    legalagreementaccepted: {
        type: Boolean,
        required: [true, 'You must agree to the terms']
    },
    cdate: {
        type: Date,
        default: Date.now
    }
});

const Adoptions = mongoose.model('Adoptions', adoptionSchema, 'adoptions');

// create
exports.addForm = function (data) {
    return Adoptions.create({
        uid: data.uid,
        pid: data.pid,
        housingtype: data.housingtype,
        experience: data.experience,
        reasonforadoption: data.reasonforadoption,
        legalagreementaccepted: data.legalagreementaccepted,
        status: 'pending'
    });
}

// read
exports.findByID = function(id) {
    return Adoptions.find({ uid: id })
}

exports.findAll = function() {
    return Adoptions.find()
}

exports.findByApplicationID = function(id) {
    return Adoptions.findOne({ _id: id })
}

// update
exports.updateForm = function(id, data) {
    return Adoptions.updateOne({ _id: id }, { $set: data })
}


// delete
exports.deleteForm = function(id) {
    return Adoptions.deleteOne({ _id: id })
}

