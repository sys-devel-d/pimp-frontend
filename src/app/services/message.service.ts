import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Message, MessageCollection } from '../models/message';
import { AuthService } from './auth.service';

@Injectable()
export class MessageService {

  socket: any;
  stompClient: any;
  sessionPool: {};
  currentRoom: string;
  messages: MessageCollection = {};
  rooms: string[] = [];

  constructor(private authService: AuthService) {
    if(authService.isLoggedIn()) {
      this.init();
    }
  }

  init() {
    /*
    Each room in the `message: MessageCollection` must be initialized with an empty array,
    otherwise Angular does not pick up changes in this nested data structure.
    Need to find out how it behaves when a room is added dynamically.
    */
    this.getInitialRooms().then( (rooms: string[]) => {
      let token = this.authService.getToken();
      // TODO: move url to config. might be different on production
      let socket = new SockJS('http://localhost:8080/chat/' + '?access_token=' + token);
      this.socket = socket;
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = null;

      for(let room of rooms) {
        this.rooms.push(room);
        this.messages[room] = [];
      }

      this.subscribe(rooms);
    } );
  }

  /* Get all rooms in which user is member */
  getInitialRooms() {
    return new Promise( (resolve, reject) => {
      // Make HTTP call when the endpoint is implemented
      // For now fake the response
      const rooms = ["general", "watercooler", "beer"];
      this.currentRoom = rooms[0];
      resolve( rooms );
    });
  }

  publish(roomId: String, message: string) {
    let userName = JSON.parse(localStorage.getItem('currentUser')).username;
    this.stompClient.send('/app/broker/' + roomId, {},
      JSON.stringify({
        message,
        roomId,
        userName
      }));
  }

  subscribe(rooms: string[]) {
    var that = this;
    this.stompClient.connect({}, (frame) => {
      for(let roomId of rooms) {
        that.stompClient.subscribe('/rooms/message/' + roomId, function ( { body } ) {
        let message: Message = JSON.parse(body);
        // The timestamp should come from the server to prevent timezone issues
        message.date = new Date();
        that.messages[roomId].push(message);
      });
    }
        
    }, (err) => {
        console.log('err', err);
    });
  }

  getMessages() {
    return this.messages;
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  setCurrentRoom(room) {
    this.currentRoom = room;
  }

  getRooms() {
    return this.rooms;
  }

  tearDown() {
    this.stompClient.disconnect()
    this.socket.close()
    this.messages = {}
    this.rooms =  []
  }

}