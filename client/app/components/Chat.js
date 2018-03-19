import React from "react";
import ReactDOM from 'react-dom';
import io from "socket.io-client";
import './Chat.css';

/*
* class for chat box component
*/
class Chat extends React.Component{
  constructor(props){
    super(props);

    /*
    * @message: represents text entered by user
    */
    this.state = {
      message: ''
    };

    this.socket = this.props.soc;

    /*
    * handles the new message that the user entered
    * message is received by the server
    */
    this.sendMessage = ev => {
      ev.preventDefault();

      this.socket.emit('SEND_MESSAGE', {
        author: this.props.u1,
        message: this.state.message,
        room: this.props.room,
        receiver: this.props.u2
      });

      this.setState({message: ''});
    }

    /*
    * message is received by the other user in the room
    */
    this.socket.on('RECEIVE_MESSAGE', data => {
      if(data['room']==this.props.room && this.props.u1==data['receiver']) {
        const ndata = {'author': data['author'], 'message': data['message']};
        this.props.updateMessagesWith(this.props.u2,ndata);
      }
    });

    this.handleX = this.handleX.bind(this);
    this.addToChat = this.addToChat.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  /*
  * handles closing the chat box
  */
  handleX(e) {
    this.props.removeChat(this.props.u2);
  }

  /*
  * adds message to message history (state 'allmessages' in Dash)
  */
  addToChat(mess) {
    const ndata = {'author': this.props.u1, 'message': mess};
    this.props.updateMessagesWith(this.props.u2,ndata);
  }

  /*
  * adds message to message history of everyone in current room
  */
  handleKeyPress(e) {
    if(e.key === 'Enter') {
      this.addToChat(this.state.message); //add message to this user's chat
      this.sendMessage(e); //add message to other user's chat
    }
  }

  /*
  * for automatic chat scrolling behavior
  */
  componentDidMount() {
    if(this.props.ischatopen) {
      this.node.scrollIntoView();
    }
  }

  /*
  * for automatic chat scrolling behavior
  */
  componentDidUpdate() {
    if(this.props.ischatopen) {
      this.node.scrollIntoView();
    }
  }

  render(){
    const ischatopen = this.props.ischatopen;

    const chat = ischatopen ? (
      <div class="chatbox">
        <div>
          <button onClick={this.handleX} class="xbutton">X</button>
        </div>
        <div>
          <div class="chatttl">{this.props.u2}</div>
          <hr/>
          <div class="messages">
            {this.props.messages.map(message =>
              <div class="message">
                <b>{message.author}</b>: {message.message}
              </div>
            )}
            <div ref={node => this.node = node} />
          </div>
        </div>
        <div>
          <hr/>
          <input type="text" placeholder="message" onKeyPress={this.handleKeyPress}
            className="form-control" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
        </div>
      </div>
    ) : (
      <div/>
    );

    return (
      <div>{chat}</div>
    );
  }
}

export default Chat;
