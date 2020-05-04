// require the connection model from models start
var connectionDB = require('../utility/connectionDB');
var connectionModel = require('../models/connection');
var connection=require('./connectionDB.js')
var mongo = require('mongoose');
mongo.connect('mongodb://localhost/cricket', {useNewUrlParser: true});


var Schema = mongo.Schema;
var userConSch = new Schema({
      userID : String,
      connectionID:String,
      rsvp:String
});


var conDB = mongo.model('connections',connection.connectionSchema)
var userConDB = mongo.model('userConnections',userConSch);


//fucntion to add a new connection
function addConnection(connection,userId){
  var id = '17ME0';
  var defaultimageurl = "../assests/images/sachin.jfif"
  id += Math.floor(Math.random() * 10) + 7;
  var newConnection = {"connectionID":id,"userId":userId,"connectionName":connection.name,"connectionTopic":connection.topic,"Details":connection.details,"Location":connection.location,"Date":connection.date,"Time":connection.time,"imageURL":defaultimageurl};
  console.log(newConnection);
  return new Promise(resolve =>{
        resolve(conDB.collection.insertOne(newConnection).then(function(data){
          return data;
        })
      );
    });
}

//function to retrieve userprofile
function getUserProfile(userID){
  return new Promise(resolve =>{
        resolve(userConDB.find({userID:userID}).then(function(userConnections){
          console.log("here2",userConnections);
          return userConnections;
        })
      );
    });
}

//function to add rsvp
function addRSVP(connectionID, userID, rsvp,connection){
  var userConnection = {"userID":userID,"connectionID":connectionID,"rsvp":rsvp};
  return new Promise(resolve =>{
        resolve(userConDB.collection.insertOne(userConnection).then(function(data){
          return data;
        })
      );
    });
}

//function to get connection created by particular user
async function getUserConnection (connID){
     return  new Promise(resolve =>{
          resolve(userConDB.find({"connectionID":connID}).then(function(connection){
            return connection;
          })
        );
      });
  };

//function to update the rsvp of a connection
function updateRSVP(connectionID, userID, rsvp){
  console.log(rsvp);
  var userConnection = {"userID":userID,"connectionID":connectionID,"rsvp":rsvp};
  return new Promise(resolve =>{
        resolve(userConDB.updateOne({connectionID:connectionID, userID:userID},userConnection).then(function(data){
          return data;
        })
      );
    });
}

//function to delete connection
function deleteConnection(connectionID, userID){
  return new Promise(resolve =>{
        resolve(userConDB.deleteOne({connectionID:connectionID, userID:userID}).then(function(data){
          return data;
        })
      );
    });
}

//function to delete rsvp by connection id
 async function removeRSVPbyconnId(connectionID){
  return new Promise(resolve =>{
        resolve(userConDB.deleteMany({connectionID:connectionID}).then(function(data){
          return data;
        })
      );
    });
}





module.exports= {
  getUserProfile:getUserProfile,
  addRSVP:addRSVP,
  updateRSVP:updateRSVP,
  deleteConnection:deleteConnection,
  addConnection:addConnection,
  getUserConnection:getUserConnection,
  removeRSVPbyconnId:removeRSVPbyconnId
};
