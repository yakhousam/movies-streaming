require('dotenv').config();
require('./model/db');
const { setupMenu } = require('./controllers/menu_controller');
const express = require('express');
const route = require('./routes');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport')
const flash = require('connect-flash')
const auth = require('./auth')
const helmet = require('helmet')

const audience = require('mongoose').model('Audience')
// const morgan = require('morgan')

const app = express();

app.use(helmet())

auth();
setupMenu(app);

const store =  new MongoDBStore({
  uri: process.env.NODE_ENV === 'production' ? process.env.dbUri : 'mongodb://localhost/movies',
  collection:'session'
})
app.use(
  session({
    secret: process.env.SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 //one week 
    },
    resave: false,
    saveUninitialized: true,
   store
  })
);
app.use(passport.initialize());
app.use(passport.session());

// app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.set('view engine', 'pug');
app.set('views', 'views');

app.use('/static', express.static('public'));

app.use(route);

app.locals.audience = 0
setInterval(async() => {
  const view = app.locals.audience;
  if(view > 0){
    await audience.findOneAndUpdate({},{$inc:{audience: view}}, {upsert: true, useFindAndModify: false});
    app.locals.audience -= view;
  }  
}, 1000 * 180);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started at http://localhost:3000');
});
