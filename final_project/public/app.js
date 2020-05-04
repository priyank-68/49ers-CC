var express =require('express');
var app = express();
var path = require('path');
var session = require('express-session');
app.use(session({secret:'secrectApp'}));
var cookieparser = require('cookie-parser');

app.use(cookieparser());

var viewPath = path.join(__dirname, '/./views');

var connectionDB= require(__dirname, '../model/connectionDB')
app.set('view engine', 'ejs');
app.set('views', viewPath);

app.use('/assests', express.static('assests'));
app.use('/assests/css',express.static(path.join(__dirname,'/./assests/css')));
app.use('/assests/images',express.static(path.join(__dirname,'/./assests/images')));

var connectionController = require('./controller/connectionController.js');
app.use('/',connectionController);
var profileController=require('./controller/ProfileController.js');
app.use('/',profileController);

app.listen(804);
