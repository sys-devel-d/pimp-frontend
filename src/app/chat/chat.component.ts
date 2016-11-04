import { Component, OnInit } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  stompClient: any;
  roomId: any;
  text: any;
  messages: Array<String> = new Array<String>();

  send() {
    this.stompClient.send('/app/broker', {},
      JSON.stringify({ 'message': this.text }));
    this.text = "";
  }

  ngOnInit() {
    var that = this;
    var socket = new SockJS('http://localhost:8080/chat')
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, function (frame) {
        that.stompClient.subscribe('/rooms/message', function (message) {
          that.messages.push(JSON.parse(message.body));
        });
    }, function (err) {
        console.log('err', err);
    });
  }

}
