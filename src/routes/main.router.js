const express = require('express');
const mainRouter = express.Router();
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/auth');

//아무나 방문할 수 있도록 checkAuthenticated 없앰
mainRouter.get('/', (req, res) => {
    res.redirect('/products');
});

mainRouter.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('auth/login');
})

mainRouter.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('auth/signup');
})

module.exports = mainRouter;