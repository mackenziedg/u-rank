var express = require('express')();
require('dotenv').config();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express;
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Set module settings
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// db connection
var mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB); //, {user:process.env.MONGO_USER, pass:process.env.MONGO_PASSWORD});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Routes
app.get('/', function (req, res){
    res.render('index');
});

// Static import directories
// app.use('/static', serve(__dirname + '/public'));

// Start server
var port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port '+port));
