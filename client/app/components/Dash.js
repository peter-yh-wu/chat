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
    * @users is a dict w/ username as key and sid as value
    * @chats is an array of 5-tuples, (username1, sid1, username2, sid2, room),
    *   with each tuple representing an open chat
    */
    this.state = {
      username: '',
      users: [],
      chats: [],
      allmessages: []
    }; //TODO: make allmessages store all chats, later delete chats

    this.socket = io('http://127.0.0.1:5000');

    this.handleName = this.handleName.bind(this);
    this.updateChats = this.updateChats.bind(this);

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

    this.socket.on('showchat', data => {
      let b = true;
      for(var i = 0; i < this.state.chats.length; i++) {
        if(this.state.chats[i][4]==data['room']) {
          b = false;
        }
      }
      if(b) {
        this.state.chats.push(data['u1'].concat(data['u2'],data['room']));
        this.setState({chats: this.state.chats});
      }
      //this.socket.to(data['room']).emit('fillchat',{'room': data['room']});
    });
  };

  handleName(name) {
    this.setState({username: name});
    this.socket.emit('polo',{name:name, sid:this.socket.id});
  }

  updateChats(name) {

    //this.socket.emit('checking',name);

    let index = 0;

    for (var i = 0; i < this.state.chats.length; i++) {
      if (this.state.chats[i][2]==name)
        index = i;
    }

    this.state.chats.splice(index, 1);
    this.setState({chats: this.state.chats});
  }

  render() {
    const style = {
      'font-family': 'Helvetica',
      'font-size': '32px'
    };
    const chatshtml = this.state.chats.map((ct) =>
      <div class="child">
        <Chat updateChats={this.updateChats} ctuple={ct} soc={this.socket}/>
      </div>
    );//(MODIFY CHILD TO ACTUALLY SURROUND CHATBOX PROPERLY)

    return (
      <div>
        <h1 style={style}>Chat Server</h1>
        <Userbox changeName={this.handleName} users={this.state.users} soc={this.socket}/>
        <div>{this.state.username}</div>
        <div>{Object.keys(this.state.users).toString()}</div>
        <div id="container">
          <div id="inner">{chatshtml}</div>
        </div>
      </div>
    );
  }
}

export default Dash;
