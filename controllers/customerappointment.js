// Appointments

const express = require('express');
const user = require('../models/users');
const appointment = require('../models/appointments')
const pet = require('../models/pet');
const { authenticated, customer } = require('../middleware');

const router = express.Router();

async function appointments(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }

        const user_appointments = await appointment.showAppointments(account._id)

        return res.render('customer/appointment/appointment', { m, e, account, user_appointments });

    } catch (error) {
        console.log(error)
        return res.render('error', { e: 'error loading your account' });
    }
}

async function createappointmentpage(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }

        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/appointment/create_appointment', { m, e, account, pet_species_list });

    } catch (error) {
        console.log(error)
        return res.render('error', { e: 'error loading your account' });
    }
}

async function bookAppointment(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }

        const appointmentDate = req.body.appointmentDate;
        const timeslot = req.body.timeslot;
        const location = req.body.location;
        const petspecies = req.body.petspecies;
        let newAppointment = {
            userid: id,
            petspecies: petspecies,
            location: location,
            appointmentdate: appointmentDate,
            timeslot: timeslot,
        };

        await appointment.createAppointment(newAppointment);

        const user_appointments = await appointment.showAppointments(account._id);

        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/appointment/appointment', { m, e, account, user_appointments, pet_species_list });

    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error loading your account' });
    }
}

async function updateAppointment(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        const appointmentId = req.query.appointmentId;
        const display_appointment_details = await appointment.searchAppointmentById(appointmentId, account._id);
        let appointment_details = display_appointment_details[0];
        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/appointment/update_appointment', { m, e, appointment_details, pet_species_list })

    } catch (error) {
        console.log(error)
        return res.render('error', { e: 'error loading your account' });
    }
}

async function updatingAppointment(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        const appointmentId = req.body.appointmentId
        const appointmentDate = req.body.appointmentDate;
        const timeslot = req.body.timeslot;
        const location = req.body.location;
        const petspecies = req.body.petspecies;

        let updatedAppointment = {
            petspecies: petspecies,
            location: location,
            appointmentdate: appointmentDate,
            timeslot: timeslot,
            status: "Pending Confirmation"
        };

        await appointment.updateAppointmentById(appointmentId, account._id, updatedAppointment);
        const user_appointments = await appointment.showAppointments(account._id);
        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/appointment/appointment', { m, e, account, user_appointments, pet_species_list });

    } catch (error) {
        console.log(error);
        return res.render('error', { e: 'error loading your account' });
    }
}

async function deleteAppointment(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        const appointmentId = req.query.appointmentId;
        await appointment.deleteAppointmentById(appointmentId, account._id);

        const user_appointments = await appointment.showAppointments(account._id);

        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/appointment/appointment', { m, e, account, user_appointments, pet_species_list });

    } catch (error) {
        console.log(error)
        return res.render('error', { e: 'error loading your account' });
    }
}

router.get('/', authenticated, customer, async (req, res) => {
    return appointments(req, res, req.session.user.id, null, null);
});

router.get('/create', authenticated, customer, async (req, res) => {
    return createappointmentpage(req, res, req.session.user.id, null, null);
});

router.post('/create', authenticated, customer, async (req, res) => {
    return bookAppointment(req, res, req.session.user.id, null, null);
});

router.get('/update', authenticated, customer, async (req, res) => {
    return updateAppointment(req, res, req.session.user.id, null, null);
})

router.post('/update', authenticated, customer, async (req, res) => {
    return updatingAppointment(req, res, req.session.user.id, null, null);
})

router.get('/delete', authenticated, customer, async (req, res) => {
    return deleteAppointment(req, res, req.session.user.id, null, null);
})

module.exports = router;