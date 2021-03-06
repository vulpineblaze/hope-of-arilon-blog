const express = require('express')
const app = express()
const session = require('express-session');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const passport = require("passport");

var the_port = 3001;
// var the_port = 80;

var db
var configDB = require('./config/database.js');
var root_dir = "http://hopeofarilon.fusionbombsderp.com";


app.use(session({secret: "-- ENTER CUSTOM SESSION SECRET --"}));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport); // pass passport for configuration


app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

 

MongoClient.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./routes.js')(app, passport, db); // load our routes and pass in our app and fully configured passport

  app.listen(process.env.PORT || the_port, "127.0.0.1", () => {
    console.log('listening on '+the_port)
  })
})
