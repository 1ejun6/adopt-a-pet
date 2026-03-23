function authenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }

    return res.redirect('/login');
}

function admin(req, res, next) {
    const currentuserrole = req.session && req.session.user && req.session.user.role;

    if (!currentuserrole) {
        return res.redirect('/login');
    }
    if (currentuserrole === 'admin') {
        return next();
    }

    return res.status(403).render('error', { e: 'access denied' });
}

function customer(req, res, next) {
    const currentuserrole = req.session && req.session.user && req.session.user.role;

    if (!currentuserrole) {
        return res.redirect('/login');
    }
    if (currentuserrole === 'customer') {
        return next();
    }

    return res.status(403).render('error', { e: 'access denied' });
}

function custOnly(req, res, next) {
    const currentUserRole = req.session?.user?.role;
    if (!currentUserRole) {
        return res.redirect('/login');
    }
    else if (currentUserRole === 'admin') {
        return res.redirect('/admin');
    } else if (currentUserRole === 'customer') {
        return next();
    };

    return res.status(403).render('error', { e: 'access denied' });
};

module.exports = { authenticated, admin, customer, custOnly };