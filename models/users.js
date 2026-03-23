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

const users = mongoose.model('users', userschema);

function findonebyemail(email) {
    return users.findOne({ email });
}

function createaccount(account) {
    const newaccount = new users(account);
    return newaccount.save();
}

function findadminaccounts() {
    return users.find({ role: 'admin' }).lean();
}

function findadminbyid(id) {
    return users.findOne({ _id: id, role: 'admin' }).lean();
}

function findadminsbyids(ids) {
    return users.find({ _id: { $in: ids }, role: 'admin' }).select('email').lean();
}

function deleteadminsbyids(ids) {
    return users.deleteMany({ _id: { $in: ids }, role: 'admin' });
}

function findonebyemailexcludingid(email, id) {
    return users.findOne({ email, _id: { $ne: id } });
}

function updateadminbyid(id, updatefields) {
    return users.findOneAndUpdate(
        { _id: id, role: 'admin' },
        { $set: updatefields },
        { returnDocument: 'after', runValidators: true, context: 'query' }
    ).lean();
}

function findcustomerbyid(id) {
    return users.findOne({ _id: id, role: 'customer' }).lean();
}

function updatecustomerbyid(id, updatefields) {
    return users.findOneAndUpdate(
        { _id: id, role: 'customer' },
        { $set: updatefields },
        { returnDocument: 'after', runValidators: true, context: 'query' }
    ).lean();
}

module.exports = {findonebyemail, createaccount, findadminaccounts, findadminbyid, findadminsbyids, deleteadminsbyids, findonebyemailexcludingid, updateadminbyid, findcustomerbyid, updatecustomerbyid};