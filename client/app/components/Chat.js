import React from "react";
import io from "socket.io-client";
import './Chat.css';

class Chat extends React.Component{
  constructor(props){
    super(props);

    /*
    * messages: array s.t. each elem is a dict w/ keys author,message,room
    */
    this.state = {
      message: '',
      messages: []
    };

    this.socket = this.props.soc;

    this.sendMessage = ev => {
      ev.preventDefault();

      this.socket.emit('SEND_MESSAGE', {
        author: this.props.ctuple[0],
        message: this.state.message,
        room: this.props.ctuple[4]
      });//TODO: NO MORE USERNAME, USING CHAT TUPLE NOW

      this.setState({message: ''});
    }

    const addMessage = data => {
      this.setState({messages: [...this.state.messages, data]});
    };

    this.socket.on('RECEIVE_MESSAGE', data => {
      if(data['room']==this.props.ctuple[4])
        addMessage(data);
    });

    this.socket.on('checkroom', data => {
      if(this.props.ctuple[4]==data)
        this.socket.emit('currmess', {'room':data,'messages':this.state.messages});
    });

    //instantiate chat with existing messages
    this.socket.on('messroom', data => {
      if(this.state.messages.length == 0) {
        this.setState({messages: data['messages']});
      }
    });

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  handleClick(e) {
    this.props.updateChats(this.props.ctuple[2]);
  }

  handleKeyPress(e) {
    if(e.key === 'Enter') {
      this.sendMessage(e);
    }
  }

  scrollToBottom() {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render(){
    return (
      <div class="container">
        <div>
          <button onClick={this.handleClick} class="button">X</button>
        </div>
        <div className="card-body">
          <div class="chatttl">{this.props.ctuple[2]}</div>
          <hr/>
          <div class="messages">
            {this.state.messages.map(message => {
              return (
                <div class="message"><b>{message.author}</b>: {message.message}</div>
              )
            })}
            <div style={{ float:"left", clear: "both" }}
              ref={(el) => { this.messagesEnd = el; }}>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <hr/>
          <input type="text" placeholder="message" onKeyPress={this.handleKeyPress}
            className="form-control" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
        </div>
      </div>
    );
  }
}

export default Chat;
