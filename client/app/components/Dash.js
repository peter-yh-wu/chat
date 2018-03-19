import React from "react";
import Userbox from "./Userbox";
import Chat from "./Chat";
import io from "socket.io-client";
import './Dash.css';

/*
* Class for user dashboard, which houses all of the user's chats and
* the user-box, an interface for the user to set username and open chats
*/
class Dash extends React.Component{
  constructor(props) {
    super(props);

    /*
    * @username - name of the user
    * @users - dict w/ username as key and session id (sid) as value;
    *   contains info. about all users online
    * @rooms - dict w/ username as key and the name of the respective chat room
    *   as value
    * @allmessages - dict w/ username as key and an array of messages, with each
    *   message represented as {author:'name',message:'mess'}, as value
    * @ischatopen - dict w/ username as key and bool which represents whether
    *   chatbox is visible as value
    */
    this.state = {
      username: '',
      users: [],
      rooms: {},
      allmessages: {},
      ischatopen: {}
    };

    this.socket = io('http://127.0.0.1:5000'); //arbitrary

    this.handleName = this.handleName.bind(this);
    this.updateMessagesWith = this.updateMessagesWith.bind(this);
    this.removeChat = this.removeChat.bind(this);

    //-----------------------
    // Find all users online
    //
    /*
    * received from server, received by server
    * used by server to see who's online
    */
    this.socket.on('marco', () => {
      this.state.users = [];
      this.socket.emit('polo',{name:this.state.username, sid:this.socket.id});
    });

    /*
    * adds received user to list of online users
    */
    this.socket.on('welcome', data => {
      var cname = data['name'];
      if(cname!='' && !(Object.keys(this.state.users)).includes(cname)) {
        this.state.users[cname]=data['sid'];
        this.setState({users: this.state.users})
      }
    });

    //-----------------------
    // open a chat between respective users and populate chat w/ messages
    //
    /*
    * sends chat history w/ given user to the server
    */
    this.socket.on('checkroom', data => {
      if(this.state.username==data['n2']) {
        if(data['n1'] in this.state.allmessages) { //if there exist messages in the room already
          this.socket.emit('currmess', {'n1':data['n1'],'n2':data['n2'],'messages':this.state.allmessages[data['n1']]});
        }
        else { //if no key in allmessages, i.e. there are no messages in the room
          this.socket.emit('currmess', {'n1':data['n1'],'n2':data['n2'],'messages':[]});
        }
      }
    });

    /*
    * adds given data to chat history and makes chat visible on screen
    */
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

  /*
  * sets username to given name 'user'
  */
  handleName(user) {
    this.setState({username: user});
    this.socket.emit('polo',{name:user, sid:this.socket.id});
  }

  /*
  * adds given message to chat history with given user
  */
  updateMessagesWith(user,message) {
    let allmess = Object.assign({},this.state.allmessages);
    allmess[user].push(message);
    this.setState({allmessages: allmess});
  }

  /*
  * hides chat with given user
  */
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
        <hr/>
        <div id="chatcontainer">
          <div id="chatinner">{chatshtml}</div>
        </div>
      </div>
    );
  }
}

export default Dash;
