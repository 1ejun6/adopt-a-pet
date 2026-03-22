const express = require('express');
const bcrypt = require('bcrypt');
const user = require('../models/users');
const appointment = require('../models/appointments')
const pet = require('../models/pet');
const { authenticated, customer } = require('../middleware');
const { default: mongoose, Mongoose } = require('mongoose');

const router = express.Router();

async function read(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        return res.render('customer/read', { m, e, account });
    } catch (error) {
        return res.render('error', { e: 'error loading your account' });
    }
}

async function update(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        return res.render('customer/update', { m, e, account });
    } catch (error) {
        return res.render('error', { e: 'error loading your account' });
    }
}

async function appointments(req, res, id, m = null, e = null) {
    try {
        const account = await user.findOne({ _id: id, role: 'customer' }).lean();
        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }
        
        const user_appointments = await appointment.showAppointments(account._id)
        
        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/appointment', { m, e, account, user_appointments, pet_species_list });

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
        
        return res.render('customer/appointment', { m, e, account, user_appointments, pet_species_list });

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
        // let searchAppointment = new mongoose.Types.ObjectId(appointmentId);
        const display_appointment_details = await appointment.searchAppointmentById(appointmentId, account._id);
        let appointment_details = display_appointment_details[0];
        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/update_appointment', { m, e, appointment_details, pet_species_list })

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
        };

        await appointment.updateAppointmentById(appointmentId, account._id, updatedAppointment);
        const user_appointments = await appointment.showAppointments(account._id);
        const pet_species_list = await pet.getAllSpecies();
        
        return res.render('customer/appointment', { m, e, account, user_appointments, pet_species_list });

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
        // let searchAppointment = new mongoose.Types.ObjectId(appointmentId);
        await appointment.deleteAppointmentById(appointmentId, account._id);

        const user_appointments = await appointment.showAppointments(account._id);

        const pet_species_list = await pet.getAllSpecies();

        return res.render('customer/appointment', { m, e, account, user_appointments, pet_species_list });

    } catch (error) {
        console.log(error)
        return res.render('error', { e: 'error loading your account' });
    }
}

router.get('/', authenticated, customer, async (req, res) => {
    return res.render('customer-index', { m: `${req.session.user.email}` });
});

router.get('/read', authenticated, customer, async (req, res) => {
    return read(req, res, req.session.user.id, null, null);
});

router.get('/update', authenticated, customer, async (req, res) => {
    return update(req, res, req.session.user.id, null, null);
});

router.post('/update', authenticated, customer, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email) {
            return update(req, res, req.session.user.id, null, 'name and email are required');
        }

        const cemail = email.trim().toLowerCase();
        const existinguser = await user.findOne({ email: cemail, _id: { $ne: req.session.user.id } });
        if (existinguser) {
            return update(req, res, req.session.user.id, null, 'email already exists > please enter another email');
        }

        const updatefields = { name, email: cemail };
        if (password && password.trim()) { //update object if password change
            updatefields.password = await bcrypt.hash(password, 10);
        }

        const account = await user.findOneAndUpdate(
            { _id: req.session.user.id, role: 'customer' },
            { $set: updatefields },
            { returnDocument: 'after', runValidators: true, context: 'query' }
        ).lean();

        if (!account) {
            return res.render('error', { e: 'customer account not found' });
        }

        req.session.user.email = account.email; //updates session email so navbar updates
        return res.render('customer/update', { m: 'account updated', e: null, account });
    } catch (error) {
        return update(req, res, req.session.user.id, null, 'error updating account');
    }
});

// Appointments
router.get('/appointment', authenticated, customer, async (req, res)=> {
    return appointments(req, res, req.session.user.id, null, null);
});

router.post('/appointment', authenticated, customer, async(req, res)=> {
    return bookAppointment(req, res, req.session.user.id, null, null);
});

router.get('/appointment/update', authenticated, customer, async(req, res)=> {
    return updateAppointment(req, res, req.session.user.id, null, null);
})

router.post('/appointment/update', authenticated, customer, async(req, res)=> {
    return updatingAppointment(req, res, req.session.user.id, null, null);
})

router.get('/appointment/delete', authenticated, customer, async(req, res)=> {
    return deleteAppointment(req, res, req.session.user.id, null, null);
})

module.exports = router;