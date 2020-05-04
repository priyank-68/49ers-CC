var express=require('express');
var router=express.Router();
var session = require('express-session');

var UserPro = require('../models/UserProfile');
var UserCon= require('../models/UserConnection');
var conDB = require('../utility/connectionDB');
var userDB= require('../utility/UserDB');
var User = require('../models/User');
var userConnectionDB=require('../utility/UserConnectionDB');
var bodyParser= require('body-parser');
var urlParser = bodyParser.urlencoded({extended: false});
var { check, validationResult } = require('express-validator');
const { buildSanitizeFunction } = require('express-validator');
const sanitizeBody = buildSanitizeFunction('body');

var userProfile;
router.use( (req, res, next) => {
 res.locals.user = req.session.theUser;
 next();
});




// allowing user to signin
router.post('/login',urlParser,[
  check('email').isEmail().withMessage('username must be a email'),
  check('password').isLength({ min: 8, max: 20})
  .withMessage('Password must be between 8-20 characters long.')
  .isAlphanumeric().withMessage('Password must include lowercase,uppercase,number ')
], async function(req,res){
   var errors =validationResult(req);
   if(!errors.isEmpty()){
     var alert= errors.array();
     console.log(errors);
     res.render('login',{alert:alert,user:undefined})
   }else {
    var user = await userDB.getUserProfile(req.body.email);
    console.log(user);
    if(user== null){
      var alert="User not found";
      res.render('login',{alert:alert});
  }else  {
    console.log(user.userID);
      var getHash=userDB.getHash(req.body.password,user.salt);
      var retreivedHash= user.hash;
      if (getHash==retreivedHash) {
        var alert="You are logged in";
      req.session.theUser = user;
      userProfile = new UserPro(user);
      console.log(userProfile);
      var userConnections = await userProfile.addUserConnections(user.userID);
      console.log("here1",userConnections);
      userProfile.con_list= userConnections;
      req.session.userProfile = userProfile;
      res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
    }else{
      var alert="Password doesn't match";
      res.render('login',{alert:alert});
    }
  }
}
});


//allowing user to signup
router.post('/signup',urlParser, [
  check('firstName').matches( /^[a-zA-Z ]*$/).withMessage('FirstName must be in alphabets'),
  check('lastName').matches(/^[a-zA-Z ]*$/).withMessage('LastName must be in alphabets'),
  check('email').isEmail().withMessage('Enter valid Email'),
  check('password').isAlphanumeric().isLength({min:4}).withMessage('must be Alphabets')], async function(req,res){
    var errors =validationResult(req);
      console.log(req.body.firstName,"in profile");
      var user = await userDB.addUser(req.body);
      req.session.theUser = user;
      userProfile = new UserPro(user);
      userProfile.con_list= [];
      req.session.userProfile = userProfile;
      res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});

 });

//updating the new connection created by user
router.post('/updateNewConnection',urlParser, async function(req, res){
  connectionid=req.query.connuserid;
  userid=req.query.uuserId;
  buttonaction=req.body.action;
  if(buttonaction== 'updateconn'){
  var data=  await conDB.getConnection(connectionid);
  var alert ='';
  res.render('UpdateNewConnection',{data:data,alert:alert,user:req.session.theUser});
}else if(buttonaction== 'deleteconn'){
    console.log("in delete conn");
    console.log(connectionid);
    console.log(userid);
  await conDB.deleteConnection(connectionid,userid);
  var connInAnyUserprofile=await userConnectionDB.getUserConnection(connectionid);
  console.log(connInAnyUserprofile);
  if(connInAnyUserprofile.length!==0)
  {
    await userConnectionDB.removeRSVPbyconnId(connectionid);
  }
  var connectionTypes = await conDB.myCategories();
  var connections = await conDB.getConnections();
  var data = {
    'types':connectionTypes,
    'connections':connections
  }
  res.render('connections',{data:data,user:req.session.theUser});
  }
});

router.post('/updatedNewConnection',urlParser,[
  check('topic').custom((topic) => {return Allcheck(topic)}),
  check('topic', 'Topic should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Topic length
  check('name').custom((name) => {return Allcheck(name)}),
  check('name', 'Name should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Name length
  check('details').custom((details) => {return Allcheck(details)}), // validates Description not to be empty
  check('details', 'Description should not be more than 500 characters').isLength({max:500}),
  check('location').custom((location) => {return Allcheck(location)}),
  check('location', 'location should not be less than 4 and more than 50 characters').isLength({min:4, max:50}),
  check('date', "Date should be today or ahead of today's date").isAfter()
],  async function(req, res){
  const error = validationResult(req);
  if (error.isEmpty()){
  console.log(req.body);
  console.log(req.query.ID);
  console.log(req.query.userId);
  var alert='';
  await conDB.updateConnection(req.body,req.query.ID,req.query.userId);
  var connectionData= await conDB.getConnection(req.query.ID);
  console.log(connectionData[0].userId);
  //console.log(req.session.theUser.userId);
  res.render('connection', {result:connectionData[0],alert:alert,user:req.session.theUser});
}else{
      console.log(error)
      var alert='';
      if(error.errors[0].msg){
        var data=  await conDB.getConnection(req.query.ID);

        res.render('UpdateNewConnection', {data:data,user: req.session.theUser,  alert:error.errors[0].msg});
      }
    }
});

//allowing users to save,update, delete user connections
router.post('/savedConnections',urlParser,async function(req, res){
  if(req.body.action== undefined){
    res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
  }else if(req.session.theUser == undefined){
    res.render('index',{user:req.session.theUser});
  }else{
    var connectionId = req.query.connectionId;
    var rsvp = req.query.rsvp;
    var action = req.body.action;
    console.log(rsvp)
    var connection = await conDB.getConnection(connectionId);
    if(action == 'save'){
      var existingConnection = userProfile.existingConn(connectionId);
      if(existingConnection == 0){
        await  userProfile.addConnection(connection[0],rsvp);
        var usercons = await userProfile.addUserConnections(req.session.theUser.userID);
        userProfile.con_list= usercons;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }else{
        var  userconnection = new UserCon(connection[0],rsvp);
        await userProfile.updateConnection(userconnection);
        var usercons = await userProfile.addUserConnections(req.session.theUser.userID);
        userProfile.con_list= usercons;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }
    }else if(action == 'delete'){
      console.log("inside delete");
      var existingConnection = userProfile.existingConn(connectionId);
      console.log(existingConnection);
      if(existingConnection == 1){
        await userProfile.removeConnection(connection[0]);
        var usercons = await userProfile.addUserConnections(req.session.theUser.userID);
        userProfile.con_list= usercons;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }else{
        res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
      }
    }
  }
});

//allowing user to logout
router.get('/signout',function(req,res){
 if(req.session.theUser){
   userProfile.emptyProfile();
   req.session.destroy();
   res.redirect('/index');
 }else{
    res.redirect('/index');
 }
});

const Allcheck = function(attribute){ //to disallow specific special chars
  let regexp = /[`~$%^.*_+=;<>/?|]+/;
  if(!regexp.test(attribute)){
    return attribute
  } else{
    throw new Error('Special characters are not allowed');
  }
}


module.exports = router;
