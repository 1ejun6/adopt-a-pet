const Adopt = require("../models/adoption-application.js")

const getadminallforms = async (req, res) => {
    try {
        const forms = await Adopt.findAll()
        return res.render('admin/adoption-application/index', {
            forms,
            e: null
        })
    } catch (err) {
        console.error(err)
        return res.render('admin/adoption-application/index', {
            forms: [],
            e: 'error loading applications'
        })
    }
}

module.exports = { getadminallforms }