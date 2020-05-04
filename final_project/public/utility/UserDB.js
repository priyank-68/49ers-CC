var User = require('../models/User.js')

var mongo = require('mongoose');
var crypto = require('crypto');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
mongo.connect('mongodb://localhost:27017/cricket',{useNewUrlParser: true});
var schema = mongo.Schema;

var userSchema = new schema({
  userID : {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  emailAddress : {type: String, required: true},
    salt : {type: String, required: true},
      hash : {type: String, required: true},
  address1Field:String,
  address2Field:String,
  city:String,
  state:String,
  postCode:String,
  country:String
});

var userModel = mongo.model('users', userSchema);



function getUsers(){
  return new Promise(resolve =>{
        resolve(userModel.find({}).then(function(users){
          return users;
        })
      );
    });
}

function getUser(userID){
  return new Promise(resolve =>{
        resolve(userModel.find({userID:userID}).then(function(user){
          return user;
        })
      );
    });
}

// function getUserbyId(userID){
//   return new Promise(resolve =>{
//         resolve(userModel.find({userId:userID}).then(function(user){
//           return user;
//         })
//       );
//     });
// }

function getUserProfile(userName){
  console.log("in");
  return new Promise(resolve =>{
        resolve(userModel.findOne({emailAddress:userName}).then(function(user){
          return user;
        })
      );
    });

}

async function addUser (user){
  var salt = this.generateSalt(user.password);
  var hash = this.getHash(user.password,salt);
  console.log("salt",salt);
  console.log("hash",hash);
  var newUser = {"userId":user.userID,"firstName":user.firstName,"lastName":user.lastName,"emailAddress":user.emailAddress,
        "salt":salt,
        "hash":hash,
        "address1Field": user.address1Field,
        "address2Field": user.address2Field,
        "city":user.city,
        "state":user.state,
        "postCode":user.postCode,
        "country":user.country };
  return new Promise(resolve =>{
        resolve(userModel.collection.insertOne(newUser).then(function(data){
          return data;
        })
      );
    });
}
function getHash(password,salt) {
    var hash = crypto.pbkdf2Sync(password,salt, 1000, 64, 'sha512').toString('hex');
    return hash;
};
function generateSalt(password) {
 // Creating a unique salt for a particular user
    var salt = crypto.randomBytes(16).toString('hex');
    return salt;
};

module.exports= {
    getUsers:getUsers,
    getUserProfile:getUserProfile,
    //getUserbyId:getUserbyId,
    addUser:addUser,
    getHash:getHash,
    generateSalt:generateSalt
  };
