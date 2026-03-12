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

    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'users'
        }
    ],

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
})