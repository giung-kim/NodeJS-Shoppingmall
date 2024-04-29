function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/products');
    }
    next();
}

function checkAdmin(req, res, next) {
    if(req.isAuthenticated() && res.locals.currentUser.admin===1){
        next();
    }else{
        req.flash('error', '관리자로 로그인 하십시요.');
        res.redirect('/back');
    }
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    checkAdmin
}