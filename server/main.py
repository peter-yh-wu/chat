from flask import Flask
from flask_socketio import SocketIO, send, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KET'] = 'mysecret'
socketio = SocketIO(app)

@socketio.on('connect', namespace='/')
def test_connect():
    print('Connected')
    socketio.emit('marco',broadcast=True)

@socketio.on('polo')
def handlePolo(data):
    '''
    data is a dict w/ keys 'name' (username) and 'sid' (client session id)
    '''
    socketio.emit('welcome',data,broadcast=True)
    print(data['name'])

@socketio.on('disconnect', namespace='/')
def test_disconnect():
    print('Client disconnected')
    socketio.emit('marco',broadcast=True)

# when user logs in, emit all connected users,
# and print all connected users

@socketio.on('chatreq')
def handleChatReq(data):
    '''
    data['u1'] = [name of first user, their sid]
    data['u2'] = [name of second user, their sid]
    the generated room name is username1_username2, where username1 < sername2
    '''
    # tell dash to create a new chat btw these users
    roomstr = ''
    if data['u1'][0]<data['u2'][0]:
        roomstr = data['u1'][0]+'_'+data['u2'][0]
    else:
        roomstr = data['u2'][0]+'_'+data['u1'][0]
    join_room(roomstr,sid=data['u1'][1])
    join_room(roomstr,sid=data['u2'][1])
    print(roomstr)

    # check if the other person already has the room open
    # if so, send their chat
    socketio.emit('checkroom',roomstr,room=roomstr)

    emit('showchat',{'u1':data['u1'],'u2':data['u2'],'room':roomstr})
    # socketio.emit('fillchat',{'room': roomstr},room=roomstr)

@socketio.on('currmess')
def handleCheck(data):
    print(data)
    socketio.emit('messroom',data,room=data['room'])

@socketio.on('checking')
def handleCheck(data):
    print(data)

@socketio.on('SEND_MESSAGE')
def handleMess(data): # data is a dict
    print('sending to room '+data['room'])
    socketio.emit('RECEIVE_MESSAGE',data,room=data['room'])

if __name__ == '__main__':
    socketio.run(app)
