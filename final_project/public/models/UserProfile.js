var UserCon = require('./UserConnection');
var connection = require('./connection');
var userConDB = require('../utility/UserConnectionDB');
var conDB= require('../utility/connectionDB');


class UserPro {
  constructor(user) {
    this.User=user;
    this.con_list=[];
  }


  async addUserConnections(userID){
    var userConnectionList =[];
    var userConnections = await userConDB.getUserProfile(userID);
    for(var i=0 ; i< userConnections.length; i++){
      var connection= await conDB.getConnection(userConnections[i].connectionID);
      var rsvp = userConnections[i].rsvp;
      var userConnection = new UserCon(connection[0],rsvp);
     userConnectionList.push(userConnection);
   }
    return userConnectionList
  }

//adding  a new connection
async addConnection(connection,rsvp){
var data = await userConDB.addRSVP(connection.connectionID,this.User.userID,rsvp);
}

async removeConnection(connection){
await userConDB.deleteConnection(connection.connectionID,this.User.userID);
}

async updateConnection(userConnection){
  console.log(userConnection.rsvp);
await userConDB.updateRSVP(userConnection.Connection.connectionID,this.User.userID,userConnection.RSVP);
}


//checking if the connection already exists in the user profile
existingConn(connectionId){
  var con_available = 0;
  for(var i=0; i< this.con_list.length; i++ ){
    if(this.con_list[i].Connection.connectionID == connectionId){
      con_available = 1;
    }
  }
  return con_available ;
}

//retriving the connection
 getConnection(connectionId){
  var connection;
  if(this.con_list[i].connection.connectionID === connectionId){
    connection = this.con_list[i].connection;
  }
  return connection;
}

//getting all the connections of the user
 getConnections() {
 return this.con_list;
}

 emptyProfile(){
  this.con_list = [];

}
}
module.exports = UserPro;
