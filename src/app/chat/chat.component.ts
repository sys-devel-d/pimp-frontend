import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../services/message.service';
import { Message, User, Room } from '../models/base';
import { UserService } from "../services/user.service";
import { Globals } from '../commons/globals'
import { shakeInput } from '../commons/dom-functions'
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
  selectedGroupChatUsers: Set<User> = new Set<User>();
  groupChatUsers: User[];
  groupChatDisplayName:string;
  term: string;
  privateChatCallback: Function;
  groupChatCallback: Function;

  constructor(private messageService: MessageService, private userService: UserService) {
      this.messageService = messageService;
      this.userService = userService;
      this.privateChatCallback = this.startPrivatChat.bind(this);
      this.groupChatCallback = this.fetchUsersForGroupChatSelectionAndOpenDialog.bind(this);
      
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
    this.messageService.initChatWith([user], Globals.CHATROOM_TYPE_PRIVATE);
  }

  startGroupChat() {
    if(this.groupChatDisplayName) {
      const users = Array.from(this.selectedGroupChatUsers);
      this.messageService.initChatWith(users, Globals.CHATROOM_TYPE_GROUP, this.groupChatDisplayName);
      $('#chat-modal').modal('hide');
      this.selectedGroupChatUsers.clear();
      this.groupChatDisplayName = null;
    }
    else {
      shakeInput('#groupDisplayName');
    }
  }

  fetchUsersForGroupChatSelectionAndOpenDialog() {
    $('#chat-modal').modal('show');
    this.userService.getAllUsers()
      .subscribe( (users:User[]) => {
        this.groupChatUsers = users;
      })
  }

  send() {
    if(this.text != "") {
      this.messageService.publish(this.currentRoom.roomName, this.text);
      this.text = "";
    }
  }

  addUserToSelectedGroupUsers(user) {
    this.selectedGroupChatUsers.add(user);
  }

  removeUserFromSelectedGroupUsers(user: User) {
    this.selectedGroupChatUsers.delete(user);
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