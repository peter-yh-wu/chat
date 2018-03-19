import React from 'react';
import './Selector.css';
import io from "socket.io-client";

/*
* class for component in Userbox that allows user to pick who to chat with
*/
class Selector extends React.Component {
  constructor(props) {
    super(props);

    this.socket = this.props.soc;

    this.handleClick = this.handleClick.bind(this);
  };

  /*
  * ask to create room & open chat this user and clicked user
  */
  handleClick(e) {
    const u1 = this.props.username;
    const u2 = e.currentTarget.textContent;
    const a1 = [u1,this.props.users[u1]];
    const a2 = [u2,this.props.users[u2]];
    this.socket.emit('chatreq',{'u1':a1, 'u2':a2});
  }

  render() {
    const usershtml = Object.keys(this.props.users).filter(u => u!=this.props.username).map((cu) =>
      <a onClick={this.handleClick}>{cu}</a>
    );

    return (
      <div class="dropdown">
        <button class="dropbtn">Select a user</button>
        <div class="dropdown-content">
          {usershtml}
        </div>
      </div>
    );
  }
}

export default Selector;
