const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        required: true,
        default: 'customer'
    },
    cdate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('users', userschema);