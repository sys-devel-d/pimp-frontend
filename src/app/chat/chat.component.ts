import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { Message, MessageCollection } from '../models/message';
import {UserService} from "../services/user.service";
import {User} from "../models/user";

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
  userService: UserService;
  error: string;
  users: User[];
  term: string;
  public callbackOnSelection: Function;


  constructor(messageService: MessageService, userService: UserService) {
      this.messageService = messageService;
      this.currentRoom = messageService.getCurrentRoom();
      this.rooms = messageService.getRooms();
      this.userService = userService;
      this.callbackOnSelection = this.searchCallback.bind(this);
  }

  searchForUser() {
    if (this.term.length >= 3) {
      this.userService.search(this.term)
        .subscribe(
          res => {
            //filter for users with no room open and filter myself out
            this.users = res;
          },
          err => this.error = <any>err
        );
    }
  }

  searchCallback(user: User) {
    // open new room with user here
    console.log(user);
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