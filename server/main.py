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

# -----------------------
# open a chat btw respective users and populate chat w/ messages
#
def getRoom(name1,name2):
    roomstr = ''
    if name1<name2:
        roomstr = name1+'_'+name2
    else:
        roomstr = name2+'_'+name1
    return roomstr

@socketio.on('chatreq')
def handleChatReq(data):
    '''
    data['u1'] = [name of first user, their sid]
    data['u2'] = [name of second user, their sid]
    the generated room name is username1_username2, where username1 < sername2
    '''
    # TODO: TODO: TODO: if room has been opened before, don't join room
    # i.e. just send a signal to set ischatopen to true
    #
    roomstr = getRoom(data['u1'][0],data['u2'][0])
    join_room(roomstr,sid=data['u1'][1]) # add user1 to chat room
    join_room(roomstr,sid=data['u2'][1]) # add user2 to chat room
    print('roomstr: '+roomstr)

    # check if someone else in the room (in this case the second user) already
    # has the room open; if so, they would [emit their chat to the room]
    ndata = {'n1':data['u1'][0], 'n2':data['u2'][0]}
    socketio.emit('checkroom',ndata,room=roomstr)
        # TODO: disconnect this from chat.js

    # print(ndata)

    # tell dash to create a new chat btw these users?
    # emit('showchat',{'u1':data['u1'],'u2':data['u2'],'room':roomstr})

@socketio.on('currmess')
def handleCheck(data): # data is {'n1':_,'n2':_,'messages':_}
    print(data)
    roomstr = getRoom(data['n1'],data['n2'])
    ndata = {'n1':data['n1'], 'n2':data['n2'], 'room':roomstr, 'messages':data['messages']}
    print('ndata: ')
    print(ndata)
    socketio.emit('showchat',ndata,room=roomstr)

@socketio.on('checking')
def handleCheck(data):
    print(data)

# TODO: EVERY TIME I CLOSE THE WINDOW I GET ANOTHER MESSAGE SENDER
@socketio.on('SEND_MESSAGE')
def handleMess(data): # data is a dict
    print('sending to room '+data['room'])
    socketio.emit('RECEIVE_MESSAGE',data,room=data['room'])

if __name__ == '__main__':
    socketio.run(app)
