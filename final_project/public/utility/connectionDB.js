
var connectionModel = require('./../models/connection');

var mongo = require('mongoose');
mongo.connect('mongodb://localhost:27017/cricket',{useNewUrlParser: true});
var db = mongo.connection;
var Schema = mongo.Schema;
var conSch = new Schema({
    connectionID : {type:String, required:true},
    userId: {type:String, required:true},
    connectionTopic : {type:String, required:true},
    connectionName: {type:String, required:true},
    Details: {type:String, required:true},
    Date: {type:String, required:true},
    Time: {type:String, required:true},
    Location: {type:String, required:true},
    imageURL: {type:String, required:true}
});
var conDB = mongo.model('connections',conSch);

//function to retrive the connectiontopic
function myCategories(){
  return new Promise(resolve =>{
        resolve(conDB.distinct("connectionTopic").then(function(categories){
          return categories;
        })
      );
    });
}

//function to retrive a individual connection by using connectionID
function getConnection(connectionID){
  return new Promise(resolve =>{
        resolve(conDB.find({"connectionID":connectionID}).then(function(connection){
          return connection;
        })
      );
    });
}

//function to retrive all the connections
function getConnections() {
    return new Promise(resolve =>{
          resolve(conDB.find({}).then(function(connections){
            return connections;
          })
        );
      });
};

//function to update the details of the connection
function updateConnection(connection,connID,uID){
  var defaultimageurl = "../assests/images/sachin.jfif";
  var connectionID= connID;
  var  userId=uID;
  var updatedConnection = {"connectionID":connectionID,
       "userId":userId,
        "connectionName":connection.name,
        "connectionTopic":connection.topic,
        "Details":connection.details,
        "Date":connection.date,
        "Time":connection.time,
        "Location":connection.location,  /////////check once
        "imageURL":defaultimageurl};
  return new Promise(resolve =>{
        resolve(conDB.updateOne({"connectionID":connectionID},updatedConnection).then(function(data){
          console.log(data);
          return data;
        })
      );
    });
}

//function to delete the connection
function deleteConnection(connectionID,userID){
 return new Promise(resolve =>{
       resolve(conDB.deleteOne({connectionID:connectionID, userId:userID}).then(function(data){
         console.log("in delete",data);
         return data;
       })
     );
   });
}





module.exports={
  getConnection:getConnection,
  getConnections:getConnections,
  myCategories:myCategories,
  deleteConnection:deleteConnection,
  updateConnection:updateConnection
}
