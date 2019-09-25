import * as Colyseus from "colyseus.js";
class Game {
    constructor() {
        this.Socket = (window.location.protocol === 'https:' ? 'wss' : 'ws') + '://localhost:2657';
        this.Client;
        this.Room;
        this.isConnect = false;
        this.inRoom = false;
        this.Listen = [];
    }
    connect(open) {
        this.Client = new Colyseus.Client(this.Socket);
        this.Client.onError.add(function (err) {
            console.log("something wrong happened", err);
        });
        this.Client.onClose.add(function () {
            console.log("connection closed");
        });
        this.Client.onOpen.add(() => {
            this.isConnect = true;
            open();
        });
    }
    close() {
        this.Client.close();
        localStorage.clear();
        console.log('close')
    }
    leave() {
        localStorage.clear();
        console.log('leave')
        if (this.inRoom)
            this.Room.leave();
        this.inRoom = false;
        this.reset();
    }
    getAvailableRooms(callback) {
        if (!this.inRoom) {
            this.Client.getAvailableRooms('Backgammon', (rooms, err) => {
                if (!this.inRoom)
                    callback(rooms);
            });
        }

    }
    onState(callback) {
        this.Room.onStateChange.add((state) => {
            callback(state);
        });
    }
    send(data) {
        this.Room.send(data);
    }
    register(key, callback, listen) {
        if (this.Listen[key] == null) {
            this.Listen[key] = [];
        }
        this.Listen[key].push(callback);

        if (listen == true) {
            this.Room.listen(key, (state) => {
                callback(state.value, state);
            });
        }
    }
    listen(key, callback) {
        this.Room.listen(key, (state) => {
            callback(state);
        });
    }
    reset() {
        if (this.Room != undefined) {
            this.Listen = [];
            this.Room.removeAllListeners()
        }
    }

    join(roomId, option) {
        this.Room = this.Client.join(roomId, option);
        this.addListner();
    }
    addListner() {
        this.Room.onJoin.add(() => {
            localStorage.setItem('roomId', this.Room.id);
            // localStorage.setItem('roomSession', this.Room.sessionId);
            this.inRoom = true;
        });
        this.Room.onLeave.add(() => {
            this.inRoom = false;
            if (this.Listen['leave'] != null) {
                this.Listen['leave'][0]();
            }
        });
        this.Room.onMessage.add((data) => {
            let key = Object.keys(data)[0];
            if (this.Listen[key] != null) {
                for (let cb of this.Listen[key]) {
                    cb(data[key]);
                }
            }
            else {

            }

        });
    }
}
export default new Game;