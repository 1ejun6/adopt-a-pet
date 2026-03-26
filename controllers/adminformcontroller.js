const Adopt = require("../models/form.js")

const getadminallforms = async (req, res) => {
    try {
        const forms = await Adopt.findAll()
        return res.render('admin/form/index', {
            forms,
            e: null
        })
    } catch (err) {
        console.error(err)
        return res.render('admin/form/index', {
            forms: [],
            e: 'error loading applications'
        })
    }
}

module.exports = { getadminallforms }