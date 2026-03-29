const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    petspecies: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    appointmentdate: {
        type: Date,
        required: true
    },
    timeslot: {
        type: String,
        requrired: true
    },
    status: {
        type: String,
        required: true,
        default: "Pending Confirmation"
    },
    adminid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    cdate: {
        type: Date,
        default: Date.now
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema, "appointments");

exports.showAppointments = (userid) => {
    return Appointment.find({ userid }).sort({appointmentdate: -1, timeslot: -1});
}

exports.createAppointment = (newAppointment) => {
    return Appointment.create( newAppointment );
}

exports.searchAppointmentById = (_id, userid) => {
    return Appointment.find({ _id: _id, userid: userid });
}

exports.updateAppointmentById = (_id, userid, updatedAppointment) => {
    return Appointment.updateOne({ _id: _id, userid: userid }, updatedAppointment);
}

exports.deleteAppointmentById = (_id, userid) => {
    return Appointment.deleteOne({ _id: _id, userid: userid });
}

exports.listAllAppointments = () => {
    return Appointment.find({}).sort({appointmentdate: -1, timeslot: -1});
}

exports.confirmAppointment = (_id, status) => {
    return Appointment.updateOne({_id: _id}, {status: status});
}

exports.searchAppointmentByUser = (userid) => {
    return Appointment.find({ userid: userid });
}