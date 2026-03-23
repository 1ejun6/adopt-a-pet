const mongoose = require('mongoose');

const adoptiondriveschema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title is required'],
        trim: true
    },

    location: {
        type: String,
        required: [true, 'location is required'],
        trim: true
    },

    eventdate: {
        type: Date,
        required: [true, 'date is required']
    },

    description: {
        type: String,
        trim: true
    },

    mcapacity: {
        type: Number,
        required: [true, 'max capacity required']
    },

    attendees: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        ],
        default: []
    },

    cby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'admin user is required']
    },

    status: {
        type: String,
        enum: ['open', 'closed', 'cancelled'],
        required: [true, 'status is required'],
        trim: true
    },

    cdate: {
        type: Date,
        default: Date.now
    }
});

const AdoptionDrive = mongoose.model('AdoptionDrive', adoptiondriveschema);

//Read
exports.getalldrives = () => {
    return AdoptionDrive.find({}).sort({ eventdate: 1 }).lean();
}

exports.getalldrivesdescending = () => {
    return AdoptionDrive.find({}).sort({ eventdate: -1 }).lean();
}

//Create
exports.createdrive = (driveData) => {
    return AdoptionDrive.create(driveData);
}

//Read by ID
exports.getdrivebyid = (_id) => {
    return AdoptionDrive.findById(_id).lean();
}

//Update
exports.updatedrive = (_id, driveData) => {
    return AdoptionDrive.findByIdAndUpdate(
        _id,
        driveData,
        { returnDocument: 'after', runValidators: true }
    );
}

//Delete
exports.deletedrive = (_id) => {
    return AdoptionDrive.findByIdAndDelete(_id);
}