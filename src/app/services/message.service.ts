import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

@Injectable()
export class MessageService {
  stompClient: any;
  session: any;
  sessionPool: {}

  constructor() {
    let token = JSON.parse(localStorage.getItem('currentUser')).token;
    let socket = new SockJS('http://localhost:8080/chat/' + '?access_token=' + token);
    this.stompClient = Stomp.over(socket);
  }

  publish(roomId: String, message: String) {
    let userName = JSON.parse(localStorage.getItem('currentUser')).username;
    this.stompClient.send('/app/broker/' + roomId, {},
      JSON.stringify({
        'message': message,
        'roomId': roomId,
        'userName': userName
      }));
  }

  subscribe(roomId: String, callback: (string) => any) {
    var that = this;
    let session = this.stompClient.connect({}, function (frame) {
        that.stompClient.subscribe('/rooms/message/' + roomId, function (message) {
          callback(message.body);
        });
    }, function (err) {
        console.log('err', err);
    });
  }

}
