import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Message, MessageCollection } from '../models/message';

@Injectable()
export class MessageService {

  stompClient: any;
  sessionPool: {};
  currentRoom = "general";

  messages: MessageCollection = {};
  rooms: string[] = [];

  constructor() {
    /*
    Each room in the `message: MessageCollection` must be initialized with an empty array,
    otherwise Angular does not pick up changes in this nested data structure.
    Need to find out how it behaves when a room is added dynamically.
    */
    this.getInitialRooms().then( (rooms: string[]) => {

      let token = JSON.parse(localStorage.getItem('currentUser')).token;
      // TODO: move url to config. might be different on production
      let socket = new SockJS('http://localhost:8080/chat/' + '?access_token=' + token);
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
      resolve( [this.currentRoom, "watercooler", "beer"] );
    });
  }

  publish(roomId: String, message: string) {
    console.log("Publishing room " + roomId)
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

  getRoomId() {
    return this.currentRoom;
  }

  setRoomId(room) {
    this.currentRoom = room;
  }

  getRooms() {
    return this.rooms;
  }

}