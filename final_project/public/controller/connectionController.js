var express=require('express');
var router=express.Router();
var connectionController = express();
var conDB= require('../utility/connectionDB');
var userConnectionDB = require('../utility/UserConnectionDB');
var UserPro = require('../models/UserProfile');


var bodyParser= require('body-parser');
var urlParser = bodyParser.urlencoded({extended: false});
var { check, validationResult } = require('express-validator');

//rendering index page
router.get('/',function(req,res){
  res.render('index',{user:req.session.theUser});
});

//rendering index page
router.get('/index',function(req,res){
  res.render('index',{user:req.session.theUser});
});

//rendering login page
router.get('/login',function(req,res){
  if(!req.session.theUser){
  var alert='';
  res.render('login',{alert:alert,user:req.session.theUser});
}
else{
  var alert="You are already logged in";
  res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser});
}
});

//rendering signup page
router.get('/signup',function(req,res){
  var alert ="";
    res.render('signup', {user:req.session.theUser,alert:alert});//render home page
});

//rendering connection page
router.get('/connection',async function(req,res){
  var connectionId = req.query.connectionId;
  var connectionTypes = await conDB.myCategories();
  var connection =  await conDB.getConnections();
  var data = {
    'types':connectionTypes,
    'connections':connection
  }
    if(connectionId !== undefined && connectionId !== null)  //checking for valid connection id connection
    {
  	  var result = await conDB.getConnection(connectionId);
  	  if(result != null){
        var alert ='';
  		  res.render('connection',{result:result[0],alert:alert,user:req.session.theUser});
  	  }
    }
      else   //invalid connection ID gets redirected to connections page
      {
  		   res.render('connections',{data:data,user:req.session.theUser});
  	  }
});

//rendering connections page
router.get('/connections',async function(req,res){

  var connectionTypes = await conDB.myCategories();
  var connections = await conDB.getConnections();
  var data = {
    'types':connectionTypes,
    'connections':connections
  }
  res.render('connections',{data:data,user:req.session.theUser});
});

//rendering savedconnections page
router.get('/savedConnections',async function(req,res){
  if(req.session.theUser){
    var alert = '';
    var user=req.session.theUser;
    console.log("in get saved conn:",user);
    userProfile = new UserPro(user);
    console.log("in get saved conn:",userProfile);

    var userConnections = await userProfile.addUserConnections(req.session.theUser.userID);
    userProfile.con_list= userConnections;
    req.session.userProfile = userProfile;
    console.log("in get saved conn:",userProfile);
    res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser}); //render savedConnections page
  }else{
    var alert = "Please login to view saved connections page"
    res.render('login',{alert:alert,user:req.session.theUser});
  }
});

//rendering about page
router.get('/about',function(req,res){
  res.render('about',{user:req.session.theUser});
});

//rendering contact page
router.get('/contact',function(req,res){
  res.render('contact',{user:req.session.theUser});
});

//rendering newconnection page
router.get('/newConnection',function(req,res){
  if(req.session.userProfile){
var alert='';
res.render('newConnection', {user:req.session.theUser,alert:alert});//render newConnection page
}else{
  var alert = "Please login to add new connections page"
  res.render('login',{alert:alert,user:req.session.theUser});
}

});


//validation and rendering newConnection page
router.post('/newConnection',urlParser,[
  check('topic').custom((topic) => {return Allcheck(topic)}),
  check('topic', 'Topic should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Topic length
  check('name').custom((name) => {return Allcheck(name)}),
  check('name', 'Name should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Name length
  check('details').custom((detail) => {return Allcheck(detail)}), // validates Description not to be empty
  check('details', 'Description should not be more than 500 characters').isLength({max:500}),
  check('location').custom((location) => {return Allcheck(location)}),
  check('location', 'location should not be less than 4 and more than 50 characters').isLength({min:4, max:50}),
  check('date', "Date should be today or ahead of today's date").isAfter()
], async function(req,res){
  const error = validationResult(req);
  if (error.isEmpty()){
    if(req.session.theUser){
      try{
        var alert='';
  console.log("in new connection post",req.session.theUser.userID)
   await userConnectionDB.addConnection(req.body,req.session.theUser.userID);

 }catch(err){
        console.error(err);
      }
  res.redirect('/connections');
}
else{
     var alert='Please Login to create a new connection!';
      res.render('newConnection', {user: req.session.theUser,alert:alert});
    }
  }
  else{
      console.log(error);
      var alert='';
      if(error.errors[0].msg){
        res.render('newConnection', {user: req.session.theUser,  alert:error.errors[0].msg});
      }
    }
  });

//function to get categories
var getconnectionType = function()
{
  let connectionTypes = [];
  let data = conDB.getConnections();
  data.forEach(function(connection)
  {
    if(!connectionTypes.includes(connection.connectionTopic))
    {
      connectionTypes.push(connection.connectionTopic);
    }
  });
  return connectionTypes;
}
const Allcheck = function(attribute){ //to disallow specific special chars
  let regexp = /[`~$%^.*_+=;<>/?|]+/;
  if(!regexp.test(attribute)){
    return attribute
  } else{
    throw new Error('Special characters are not allowed');
  }
}

module.exports = router;
