"""
Code for Flask Server

handles room-related requests and broadcasts to all clients
"""

from flask import Flask
from flask_socketio import SocketIO, send, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KET'] = 'mysecret'
socketio = SocketIO(app)

# -----------------------
# Find all users online
#
@socketio.on('connect', namespace='/')
def test_connect():
    '''
    retrieves all currently online users whenever a new user connects
    '''
    socketio.emit('marco',broadcast=True)

@socketio.on('polo')
def handlePolo(data):
    '''
    prompts all clients to add given user to their list of online users
    data is a dict w/ keys 'name' (username) and 'sid' (client session id)
    '''
    socketio.emit('welcome',data,broadcast=True)

@socketio.on('disconnect', namespace='/')
def test_disconnect():
    '''
    retrieves all currently online users whenever a new user disconnects
    '''
    socketio.emit('marco',broadcast=True)

# -----------------------
# open a chat btw respective users and populate chat w/ messages
#
def getRoom(name1,name2):
    '''
    returns the name of the room for users 'name1' and 'name2'
    the generated room name is 'username1 username2', where username1 < username2
    '''
    roomstr = ''
    if name1<name2:
        roomstr = name1+' '+name2
    else:
        roomstr = name2+' '+name1
    return roomstr

@socketio.on('chatreq')
def handleChatReq(data):
    '''
    prompts other user in the room to return their chat history w/ the user who
    sent this chat request
    @data -
        data['u1'] = [name of first user, their sid]
        data['u2'] = [name of second user, their sid]
    '''
    roomstr = getRoom(data['u1'][0],data['u2'][0])
    join_room(roomstr,sid=data['u1'][1]) # add user1 to chat room
    join_room(roomstr,sid=data['u2'][1]) # add user2 to chat room

    ndata = {'n1':data['u1'][0], 'n2':data['u2'][0]}
    socketio.emit('checkroom',ndata,room=roomstr)

@socketio.on('currmess')
def handleCheck(data):
    '''
    prompts client Dash to display given message.
    note this client is the same one that sent 'chatreq' to the server.
    @data - {'n1':'name','n2':'name','messages':[...]}
    '''
    roomstr = getRoom(data['n1'],data['n2'])
    ndata = {'n1':data['n1'], 'n2':data['n2'], 'room':roomstr, 'messages':data['messages']}
    socketio.emit('showchat',ndata,room=roomstr)

@socketio.on('SEND_MESSAGE')
def handleMess(data):
    '''
    sends the given message to the other user in the given room.
    @data - a dict with keys 'author','message','room', and 'receiver'
    '''
    socketio.emit('RECEIVE_MESSAGE',data,room=data['room'])

if __name__ == '__main__':
    socketio.run(app)
