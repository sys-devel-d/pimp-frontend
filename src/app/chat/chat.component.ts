import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { Message, MessageCollection } from '../models/message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  currentRoom: string;
  text: string;
  messages: MessageCollection;
  currentMessages: Message[];
  rooms: String[];
  messageService: MessageService;

  constructor(messageService: MessageService) {
    this.messageService = messageService;
    this.currentRoom = messageService.getCurrentRoom();
    this.rooms = messageService.getRooms();
  }

  send() {
    this.messageService.publish(this.currentRoom, this.text);
    this.text = "";
  }

  ngOnInit() {
    this.messages = this.messageService.getMessages();
    this.currentMessages = this.messages[this.currentRoom];
  }

  setCurrentRoom(room) {
    this.messageService.setCurrentRoom(room);
    this.currentRoom = room;
    this.currentMessages = this.messages[room];
  }
}