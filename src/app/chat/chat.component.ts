import { Component, OnInit, OnDestroy} from '@angular/core';
import { MessageService } from '../services/message.service';
import { Message, User, Room } from '../models/base';
import { UserService } from "../services/user.service";
import { Globals } from '../commons/globals'
import { shakeInput, showChatModal, hideChatModal } from '../commons/dom-functions'
declare var $:any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  // The message being typed
  text: string;
  rooms: Room[];
  currentRoom: Room;
  roomBeingEdited: Room;
  isInChatRoomEditMode: boolean = false;
  error: string;
  // Users found by search
  users: User[];
  // Users added to group
  selectedGroupChatUsers: User[] = [];
  // All users available for selection
  groupChatUsers: User[];
  groupChatDisplayName:string;
  // The search term
  term: string;
  privateChatCallback: Function;
  groupChatCallback: Function;

  constructor(private messageService: MessageService, private userService: UserService) {
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
      this.messageService.initChatWith(
        this.selectedGroupChatUsers,
        Globals.CHATROOM_TYPE_GROUP,
        this.groupChatDisplayName
      );
      hideChatModal();
      this.resetChatRoomBeingEdited();
    }
    else {
      shakeInput('#groupDisplayName');
    }
  }

  fetchUsersForGroupChatSelectionAndOpenDialog(firstUser?:User) {
    if(this.isInChatRoomEditMode) {
      this.resetChatRoomBeingEdited();
    }
    showChatModal();
    this.isInChatRoomEditMode = false;
    if(firstUser) {
      this.addUserToSelectedGroupUsers(firstUser);
    }
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

  prepareEditingRoom(room:Room) {
    if(!this.isInChatRoomEditMode) {
      this.resetChatRoomBeingEdited();
    }
    this.roomBeingEdited = room;
    this.fetchUsersForGroupChatSelectionAndOpenDialog();
    this.isInChatRoomEditMode = true;
    this.selectedGroupChatUsers = room.participants;
    this.groupChatDisplayName = room.displayNames[Globals.HASH_KEY_DISPLAY_NAME_GROUP];
  }

  editRoom() {
    if(this.groupChatDisplayName) {
      const participants = this.selectedGroupChatUsers;
      for(let p of participants) {
        delete p['authorities']
      }
      const room = {
        roomName: this.roomBeingEdited.roomName,
        displayNames: {
          [Globals.HASH_KEY_DISPLAY_NAME_GROUP]: this.groupChatDisplayName
        },
        participants: participants,
        roomType: Globals.CHATROOM_TYPE_GROUP,
        messages: []
      }
      this.messageService.editRoom(room).subscribe(
        (editedRoom:Room) => {
          hideChatModal();
          this.isInChatRoomEditMode = false;
          const i = this.rooms.findIndex( r => r.roomName == editedRoom.roomName);
          /* We are not changing the messages. The ones coming back from the server
             could be older than the ones on the client */
          editedRoom.messages = this.rooms[i].messages;
          this.rooms[i] = editedRoom;
          this.resetChatRoomBeingEdited();
        },
        err => console.log(err)
      );
    }
    else {
      shakeInput('#groupDisplayName');
    }
  }

  addUserToSelectedGroupUsers(user: User) {
    if(!this.selectedGroupChatUsers.find( usr => usr.userName == user.userName)) {
      this.selectedGroupChatUsers.push(user);
    }
  }

  removeUserFromSelectedGroupUsers(user: User) {
    this.selectedGroupChatUsers =
      this.selectedGroupChatUsers.filter( usr => usr.userName != user.userName);
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

  private resetChatRoomBeingEdited() {
    this.selectedGroupChatUsers = [];
    this.groupChatDisplayName = null;
    this.roomBeingEdited = null;
  }
}