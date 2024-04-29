const express = require('express');
const passport = require('passport');
const sendMail = require('../mail/mail');
const User = require('../models/users.model');
const usersRouter = express.Router();

//#region login
usersRouter.post('/login', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.json({ msg: info });
        }

        req.logIn(user, function (err) {
            if (err) { return next(err); }
            res.redirect('/products');
        })
    })(req, res, next)
})
//#endregion

//#region  logout
usersRouter.post('/logout', (req, res, next) => {
    req.logOut(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    })
})
//#endregion

//#region  signup
usersRouter.post('/signup', async (req, res) => {
    // user 객체를 생성합니다. 
    const user = new User(req.body);

    // {
    //     email: 'test1@naver.com',
    //     password: '1234567',
    //     _id: Object(sdokfwekpfkpweokfpweof)
    // }

    try {
        // user 컬렉션에 유저를 저장합니다.
        await user.save();
        // 이메일 보내기 
        //sendMail('johnahn@example.com', 'John Ahn', 'welcome');
        res.redirect('/login');
    } catch (error) {
        console.error(error);
    }
})
//#endregion

usersRouter.get('/google', passport.authenticate('google'));

usersRouter.get('/google/callback', passport.authenticate('google', {
    successReturnToOrRedirect: '/products',
    failureRedirect: '/login'
}));

usersRouter.get('/kakao', passport.authenticate('kakao'));

usersRouter.get('/kakao/callback', passport.authenticate('kakao', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));


module.exports = usersRouter;