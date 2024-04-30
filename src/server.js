const cookieSession = require('cookie-session');
const express = require('express');
const { default: mongoose } = require('mongoose');
const passport = require('passport');
const app = express();
const path = require('path');
const flash = require('connect-flash');

const config = require('config');
const session=require('express-session');
const methodOverride=require('method-override');

//#region Router Definitions
const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');
const productsRouter = require('./routes/products.router');
const cartRouter = require('./routes/cart.router');
const adminCategoriesRouter = require('./routes/admin-categories.router');
const adminProductsRouter = require('./routes/admin-products.router');
//#endregion


const serverConfig = config.get('server');


const port = serverConfig.port;
const fileUpload=require('express-fileupload');


require('dotenv').config()




//#region cookie-Session
app.use(cookieSession({
    name: 'cookie-session-name',
    keys: [process.env.COOKIE_ENCRYPTION_KEY]
}))




// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})
//#endregion



//#region express-session
//app.use(session({
//     secret: 'superSecret',
//     cookie:{
//         httpOnly:true,
//         secure:false
//     },
//     name:'shop-app-cookie',
//     resave:false,
//     saveUninitialized:false
// }))
//#endregion


//#region Middleware Setup
app.use(flash());
app.use(methodOverride('_method'));

app.use(fileUpload());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//#endregion

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongodb connected')
    })
    .catch((err) => {
        console.log(err);
    })

app.use( express.static(path.join(__dirname, 'public')));


app.use((req,res,next)=>{
    res.locals.cart = req.session.cart;
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    res.locals.currentUser=req.user;
    next();
})




//#region Routes
app.use('/', mainRouter);
app.use('/auth', usersRouter);
app.use('/admin/products', adminProductsRouter);
app.use('/admin/categories', adminCategoriesRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
//#endregion


//region Error handling
app.use((err,req,res,next)=>{
    res.status(err.status ||500);
    res.send(err.message||'에러가 발생했습니다.')
})
//#endregion


app.listen(port, () => {
    console.log(`Listening on ${port}`);
})