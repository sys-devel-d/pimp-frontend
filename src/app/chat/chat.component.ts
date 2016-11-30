import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../services/message.service';
import { Message, MessageCollection } from '../models/message';
import { UserService } from "../services/user.service";
import { User } from "../models/user";
import Room from '../models/room';
declare var $:any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  text: string;
  rooms: Room[];
  currentRoom: Room;
  error: string;
  users: User[];
  term: string;
  callbackOnSelection: Function;
  selectedUser: User


  constructor(private messageService: MessageService, private userService: UserService) {
      this.messageService = messageService;
      this.userService = userService;
      this.callbackOnSelection = this.searchCallback.bind(this);
      
      /**
       * Need to subscribe to data changes in MessageService. At this time
       * the init() method of MessageService might not be finished with its
       * request.
       */
      this.messageService.currentRoomChange.subscribe( (currentRoom:Room) => {
        this.currentRoom = currentRoom;
      });

      this.messageService.roomsChange.subscribe ( (rooms:Room[]) => {
        this.rooms = rooms;
      });

      this.messageService.chatErrorMessageChange.subscribe( err => {
        this.setError(err);
      });
  }

  searchForUser() {
    if (this.term.length >= 3) {
      this.userService.search(this.term)
        .subscribe(
          (users: User[]) => this.users = users,
          err => this.setError(err)
        );
    }
  }

  startPrivatChat(user: User) {
    this.messageService.initPrivateChat(user);
    $('#chat-modal').modal('hide');
  }

  searchCallback(user: User) {
    this.selectedUser = user;
    $('#chat-modal').modal('show');
  }

  send() {
    if(this.text != "") {
      this.messageService.publish(this.currentRoom.roomName, this.text);
      this.text = "";
    }
  }

  ngOnInit() {
    this.currentRoom = this.messageService.getCurrentRoom();
    this.rooms = this.messageService.getRooms();
  }

  setCurrentRoom(room:Room) {
    this.messageService.setCurrentRoom(room);
    this.currentRoom = room;
  }

  ngOnDestroy() {
    // Maybe unsubscribe from subcriptions to save mem?
    // http://stackoverflow.com/a/34714574
  }

  private setError(err:string): void {
    this.error = err;
    setTimeout( () => this.error = '', 3000);
  }
}