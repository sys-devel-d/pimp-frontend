import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User, Room } from '../../models/base';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';
import { Globals } from '../../commons/globals';
import { shakeInput, showChatModal, hideChatModal } from '../../commons/dom-functions';

const DOM_ID_GROUP_DISPLAY_NAME = '#groupDisplayName';

@Component({
  selector: 'group-chat-editor',
  templateUrl: './group-chat-editor.component.html',
  styleUrls: ['./group-chat-editor.component.scss']
})
export default class GroupChatEditorComponent {
  @Input() updateRoom: Function;

  displayName: string;
  fetchedUsers: User[];
  selectedUsers: User[] = [];
  isInEditMode: boolean = false;
  roomBeingEdited: Room;

  constructor(private userService: UserService, private messageService: MessageService) { }

  fetchUsersForSelectionAndOpenDialog(firstUser?: User) {
    if (this.isInEditMode) {
      this.resetChatRoomBeingEdited();
    }
    showChatModal();
    this.isInEditMode = false;
    if (firstUser) {
      this.addToSelectedUsers(firstUser);
    }
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.fetchedUsers = users;
    }
    )
  }

  private resetChatRoomBeingEdited() {
    this.selectedUsers = [];
    this.displayName = null;
    this.roomBeingEdited = null;
  }

  private addToSelectedUsers(user: User) {
    if (!this.selectedUsers.find(usr => usr.userName == user.userName)) {
      this.selectedUsers.push(user);
    }
  }

  private removeFromSelectedUsers(user: User) {
    this.selectedUsers =
      this.selectedUsers.filter(usr => usr.userName != user.userName);
  }

  private startGroupChat() {
    if (this.displayName) {
      this.messageService.initChatWith(
        this.selectedUsers,
        Globals.CHATROOM_TYPE_GROUP,
        this.displayName
      );

      hideChatModal();
      this.resetChatRoomBeingEdited();
    }
    else {
      shakeInput(DOM_ID_GROUP_DISPLAY_NAME);
    }
  }

  prepareEditingRoom(room: Room) {
    if (!this.isInEditMode) {
      this.resetChatRoomBeingEdited();
    }
    this.roomBeingEdited = room;
    this.fetchUsersForSelectionAndOpenDialog();
    this.isInEditMode = true;
    this.selectedUsers = room.participants;
    this.displayName = room.displayNames[Globals.HASH_KEY_DISPLAY_NAME_GROUP];
  }

  private editRoom() {
    if (this.displayName) {
      const participants = this.selectedUsers;
      const room = {
        roomName: this.roomBeingEdited.roomName,
        displayNames: {
          [Globals.HASH_KEY_DISPLAY_NAME_GROUP]: this.displayName
        },
        participants: participants,
        roomType: Globals.CHATROOM_TYPE_GROUP,
        messages: []
      };
      this.messageService.editRoom(room).subscribe(
        (editedRoom: Room) => {
          hideChatModal();
          this.isInEditMode = false;
          this.updateRoom(editedRoom);
          this.resetChatRoomBeingEdited();
        },
        err => console.log(err)
      );
    }
    else {
      shakeInput(DOM_ID_GROUP_DISPLAY_NAME);
    }
  }
}