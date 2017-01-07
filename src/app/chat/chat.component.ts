import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '../services/message.service';
import { Message, User, Room, Notification } from '../models/base';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import NotificationService from '../services/notification.service';
import { Globals } from '../commons/globals';
import { shakeInput, scrollDownChatMessageContainer } from '../commons/dom-functions';
import GroupChatEditorComponent from './editor/group-chat-editor.component'

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @ViewChild(GroupChatEditorComponent) groupChatEditor: GroupChatEditorComponent;

  // The message being typed
  private text: string;
  private rooms: Room[];
  private currentRoom: Room;
  private error: string;
  // Users found by search
  private users: User[];
  // The search term
  private term: string;
  private privateChatCallback: Function;
  private groupChatCallback: Function;
  private updateRoomCallback: Function;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthService) {
      this.router = router;
      this.privateChatCallback = this.startPrivatChat.bind(this);
      this.groupChatCallback = this.fetchUsersForSelectionAndOpenDialog.bind(this);
      this.updateRoomCallback = this.updateRoom.bind(this);

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

  private updateRoom(editedRoom: Room) {
    const i = this.rooms.findIndex( r => r.roomName == editedRoom.roomName );
    /* We are not changing the messages. The ones coming back from the server
        could be older than the ones on the client */
    editedRoom.messages = this.rooms[i].messages;
    this.rooms[i] = editedRoom;
  }

  private fetchUsersForSelectionAndOpenDialog(firstUser?: User) {
    this.groupChatEditor.fetchUsersForSelectionAndOpenDialog(firstUser);
  }

  private prepareEditingRoom(room: Room) {
    this.groupChatEditor.prepareEditingRoom(room);
  }

  private searchForUser() {
    if (this.term.length >= 3) {
      this.userService.search(this.term)
        .subscribe(
          (users: User[]) => this.users = users,
          err => this.setError(err)
        );
    }
  }

  private linkToPrivateChatPartner(users: Array<User>) {
    let ownUserName = this.userService.currentUser.userName;
    let otherUserList: Array<User> = users.filter(
      user => user.userName !== ownUserName);
    let privateChatPartner = otherUserList[0];
    this.router.navigate(['/profile', privateChatPartner.userName]);
  }

  private linkToChatPartner(userName: String) {
    this.router.navigate(['/profile', userName]);
  }

  private startPrivatChat(user: User) {
    this.messageService.initChatWith([user], Globals.CHATROOM_TYPE_PRIVATE);
    let notification = new Notification();
    notification.acknowledged = false;
    notification.message = 'A new private chat was started by '
      + this.authService.getCurrentUserName;
    notification.sendingUser = this.authService.getCurrentUserName();
    notification.receivingUser = user.userName;
    notification.type = 'NEW_MESSAGE';
    this.notificationService.announce(notification);
  }


  private send() {
    if(/\S/.test(this.text) && this.text != null) {
      this.messageService.publish(this.currentRoom.roomName, this.text.trim());
      this.text = "";
      scrollDownChatMessageContainer();
    }
    else {
      shakeInput('#message-input');
    }
  }

  private exitRoom(room: Room): void {
    this.messageService.exitRoom(room);
  }

  ngOnInit() {
    this.currentRoom = this.messageService.getCurrentRoom();
    this.rooms = this.messageService.getRooms();
    if (this.rooms.length > 0) {
      scrollDownChatMessageContainer();
    }
  }

  private setCurrentRoom(room:Room) {
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
