/*
* Class for user dashboard, which houses all their chats and
* the user-box, which contains info. on all the users.
*/

import React from "react";
import Userbox from "./Userbox";
import Chat from "./Chat";
import io from "socket.io-client";
import './Dash.css';

class Dash extends React.Component{
  constructor(props) {
    super(props);

    /*
    * @users - dict w/ username as key and sid as value
    *   [note users contains all users online]
    * @allmessages - dict w/ username as key and value array_of_{author,message}
    * @ischatopen - dict w/ username as key and bool as value
    */
    this.state = {
      username: '',
      users: [],
      rooms: {},
      allmessages: {},
      ischatopen: {}
    };

    this.socket = io('http://127.0.0.1:5000');

    this.handleName = this.handleName.bind(this);
    this.updateMessagesWith = this.updateMessagesWith.bind(this);
    this.removeChat = this.removeChat.bind(this);

    //-----------------------
    // Find all users online
    //
    this.socket.on('marco', () => {
      this.state.users = [];
      this.socket.emit('polo',{name:this.state.username, sid:this.socket.id});
    });

    this.socket.on('welcome', data => {
      var cname = data['name'];
      if(cname!='' && !(Object.keys(this.state.users)).includes(cname)) {
        this.state.users[cname]=data['sid'];
        this.setState({users: this.state.users})
      }
    });

    //-----------------------
    // open a chat btw respective users and populate chat w/ messages
    //
    this.socket.on('checkroom', data => {
      if(this.state.username==data['n2']) {
        if(data['n1'] in this.state.allmessages) { //if there exist messages in the room already
          this.socket.emit('currmess', {'n1':data['n1'],'n2':data['n2'],'messages':this.state.allmessages[data['n1']]});
          this.socket.emit('checking', 'old room');
        }
        else { //if no key in allmessages, i.e. there are no messages in the room
          this.socket.emit('currmess', {'n1':data['n1'],'n2':data['n2'],'messages':[]});
          this.socket.emit('checking', 'new room');
        }
      }
    });

    this.socket.on('showchat', data => {
      if(this.state.username==data['n1']) {
        if (!(data['n2'] in this.state.allmessages)) {
          this.state.rooms[data['n2']] = data['room'];

          let allmess = Object.assign({},this.state.allmessages);
          allmess[data['n2']] = data['messages'];
          this.setState({allmessages: allmess});
        }
        else if (Object.keys(this.state.allmessages[data['n2']]).length < data['messages'].length) {
          let allmess = Object.assign({},this.state.allmessages);
          allmess[data['n2']] = data['messages'];
          this.setState({allmessages: allmess});
        }
        this.state.ischatopen[data['n2']] = true;
        this.setState({ischatopen: this.state.ischatopen});
      }
    });
  };

  handleName(user) {
    this.setState({username: user});
    this.socket.emit('polo',{name:user, sid:this.socket.id});
  }

  updateMessagesWith(user,message) {
    let allmess = Object.assign({},this.state.allmessages);
    allmess[user].push(message);
    this.setState({allmessages: allmess});
  }

  removeChat(user) {
    let chatbarr = Object.assign({},this.state.ischatopen);
    chatbarr[user] = false;
    this.setState({ischatopen: chatbarr});
  }

  render() {
    let chatshtml = Object.getOwnPropertyNames(this.state.allmessages).map((user) =>
      <div class="child">
        <Chat removeChat={this.removeChat} room={this.state.rooms[user]} ischatopen={this.state.ischatopen[user]}
          messages={this.state.allmessages[user]} u1={this.state.username}
          u2={user} updateMessagesWith={this.updateMessagesWith} soc={this.socket}/>
      </div>
    );

    return (
      <div class="dash">
        <h1 font-size='32px'>Chat Server</h1>
        <Userbox changeName={this.handleName} users={this.state.users} soc={this.socket}/>
        <div>{this.state.username}</div>
        <div>{Object.keys(this.state.users).toString()}</div>
        <div id="chatcontainer">
          <div id="chatinner">{chatshtml}</div>
        </div>
      </div>
    );
  }
}

export default Dash;
