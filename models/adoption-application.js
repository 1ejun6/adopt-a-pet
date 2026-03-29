const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
    uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
    },
    pid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    housingtype: {
        type: String,
        enum: ['hdb', 'condo', 'landed'],
        required: [true, 'Housing type is required']
    },
    experience: {
        type: Number,
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

const Adoptions = mongoose.model('Adoptions', adoptionSchema, 'adoptionapplications');

// create
exports.addAdoptionApplication = function (data) {
    return Adoptions.create({
        uid: data.uid,
        pid: data.pid,
        housingtype: data.housingtype,
        experience: data.experience,
        reasonforadoption: data.reasonforadoption,
        legalagreementaccepted: data.legalagreementaccepted,
    });
}

// read
exports.findByID = function(id) {
    return Adoptions.find({ uid: new mongoose.Types.ObjectId(id) }).populate('pid')
}

exports.findAll = function() {
    return Adoptions.find().populate('uid').populate('pid')
}

exports.findByAdoptionApplicationID = function(id) {
    return Adoptions.findOne({ _id: id }).populate('uid').populate('pid')
}

// update
exports.updateAdoptionApplication = function(id, data) {
    return Adoptions.updateOne({ _id: id }, { $set: {
        housingtype: data.housingtype,
        experience: Number(data.experience),
        reasonforadoption: data.reasonforadoption,
        legalagreementaccepted: data.legalagreementaccepted === 'true'
    }})
}

exports.updateStatus = function(id, status) {
    return Adoptions.updateOne({ _id: id }, { $set: { status: status } })
}

// delete
exports.deleteAdoptionApplication = function(id) {
    return Adoptions.deleteOne({ _id: id })
}