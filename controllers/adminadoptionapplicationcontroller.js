const Adopt = require('../models/adoption-application.js')

const getadminadoptionapplications = async (req, res) => {
    try {
        const adoptionapplications = await Adopt.findAll()
        return res.render('admin/adoption-application/index', {
            adoptionapplications,
            e: null
        })
    } catch (err) {
        console.log(err)
        return res.render('admin/adoption-application/index', {
            adoptionapplications: [],
            e: 'error loading adoptionapplications'
        })
    }
}

const getupdateadoptionapplication = async (req, res) => {
    try {
        const paramid = req.params.id
        const queryid = req.query.aid

        if (!paramid && queryid) {
            return res.redirect('/admin/adoption-application/edit/' + queryid)
        }

        const id = paramid || queryid
        if (!id) {
            return res.redirect('/admin/adoption-application')
        }
        const adoptionapplication = await Adopt.findByAdoptionApplicationID(id)
        if (!adoptionapplication) {
            return res.redirect('/admin/adoption-application')
        }
        return res.render('admin/adoption-application/update', {
            adoptionapplication,
            e: null
        })
    } catch (err) {
        console.log(err)
        return res.redirect('/admin/adoption-application')
    }
}

const updateadoptionapplication = async (req, res) => {
    try {
        await Adopt.updateStatus(req.params.id, req.body.status)
        return res.redirect('/admin/adoption-application')
    } catch (err) {
        console.log(err)
        return res.render('error', { e: 'error updating adoption application status' })
    }
}

module.exports = { getadminadoptionapplications, getupdateadoptionapplication, updateadoptionapplication }
