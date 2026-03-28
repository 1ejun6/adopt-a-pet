const mongoose = require('mongoose')
const Adopt = require('../models/adoption-application.js')
const Pet = require('../models/pets.js')

const getcreateadoptionapplication = async (req, res) => {
    try {
        const pid = req.query.pet || null
        if (!pid) {
            return res.redirect('/customer/pet')
        }

        const pet = await Pet.getPetbyPID(pid)
        if (!pet) {
            return res.redirect('/customer/pet')
        }

        return res.render('customer/adoption-application/create', {
            pid: pid,
            pet: pet,
            m: null,
            e: null
        })
    } catch (err) {
        console.log(err)
        return res.redirect('/')
    }
}

const createadoptionapplication = async (req, res) => {
    try {
        const userID = req.session.user.id
        const adoptionapplicationData = {
            uid: new mongoose.Types.ObjectId(userID),
            pid: new mongoose.Types.ObjectId(req.body.pet),
            housingtype: req.body.housingtype,
            experience: Number(req.body.experience),
            reasonforadoption: req.body.reasonforadoption,
            legalagreementaccepted: req.body.legalagreementaccepted === 'true'
        }
        await Adopt.addAdoptionApplication(adoptionapplicationData)
        return res.redirect('/customer/adoption-application')
    } catch (err) {
        console.log(err)
        return res.redirect('/')
    }
}

const readadoptionapplications = async (req, res) => {
    try {
        const userID = req.session.user.id
        const adoptionapplications = await Adopt.findByID(userID)
        return res.render('customer/adoption-application/read', {
            adoptionapplications,
            m: null,
            e: null
        })
    } catch (err) {
        console.log(err)
        return res.redirect('/')
    }
}

const handleaction = async (req, res) => {
    const action = req.query.action
    const aid = req.query.aid

    if (!aid) {
        const userID = req.session.user.id
        const adoptionapplications = await Adopt.findByID(userID)
        return res.render('customer/adoption-application/read', {
            adoptionapplications,
            m: null,
            e: 'Please select an adoptionapplication first.'
        })
    }

    if (action === 'update') {
        return res.redirect('/customer/adoption-application/edit/' + aid)
    }

    if (action === 'delete') {
        try {
            await Adopt.deleteAdoptionApplication(aid)
            return res.redirect('/customer/adoption-application')
        } catch (err) {
            console.log(err)
            return res.render('error', { e: 'Error deleting adoptionapplication' })
        }
    }

    return res.render('error', { e: 'Invalid action. Please use update or delete.' })
}

const getupdateadoptionapplication = async (req, res) => {
    try {
        const adoptionapplication = await Adopt.findByAdoptionApplicationID(req.params.id)
        if (!adoptionapplication) {
            return res.redirect('/customer/adoption-application')
        }

        return res.render('customer/adoption-application/update', {
            adoptionapplication,
            pet: adoptionapplication.pid || null,
            m: null,
            e: null
        })
    } catch (err) {
        console.log(err)
        return res.redirect('/')
    }
}

const updateadoptionapplication = async (req, res) => {
    try {
        await Adopt.updateAdoptionApplication(req.params.id, req.body)
        return res.redirect('/customer/adoption-application')
    } catch (err) {
        console.log(err)
        return res.redirect('/')
    }
}

const deleteadoptionapplication = async (req, res) => {
    try {
        await Adopt.deleteAdoptionApplication(req.params.id)
        return res.redirect('/customer/adoption-application')
    } catch (err) {
        console.log(err)
        return res.redirect('/')
    }
}

module.exports = { getcreateadoptionapplication, createadoptionapplication, readadoptionapplications, handleaction, getupdateadoptionapplication, updateadoptionapplication, deleteadoptionapplication }
