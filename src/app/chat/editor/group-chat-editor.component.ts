import { Component, Input } from '@angular/core';
import { User, Room } from '../../models/base';
import { UserService } from '../../services/user.service';
import { MessageService } from '../../services/message.service';
import { Globals } from '../../commons/globals';
import { shakeInput, showAppModal, hideAppModal } from '../../commons/dom-functions';

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

  constructor(private userService: UserService, private messageService: MessageService) {}

  fetchUsersForSelectionAndOpenDialog(firstUser?: User) {
    if (this.isInEditMode) {
      this.resetChatRoomBeingEdited();
    }
    this.isInEditMode = false;
    showAppModal();
    if (firstUser) {
      this.selectedUsers.push(firstUser);
    }
    this.userService.getAllUsers().subscribe((users: User[]) => {
      this.fetchedUsers = users;
    });
  }

  private resetChatRoomBeingEdited() {
    this.selectedUsers = [];
    this.displayName = null;
    this.roomBeingEdited = null;
  }

  private startGroupChat() {
    if (this.displayName) {
      this.messageService.initChatWith(
        this.selectedUsers,
        Globals.CHATROOM_TYPE_GROUP,
        this.displayName
      );

      hideAppModal();
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
    this.selectedUsers = room.participants.filter( user => {
      return user.userName !== this.userService.currentUser.userName;
    });
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
          hideAppModal();
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

  private onSelectedUsersUpdate(users: User[]) {
    this.selectedUsers = users;
  }

  private displayUser(user: User): string {
    return `${user.firstName} ${user.lastName} (${user.userName})`;
  }

  private displaySelectedUser(user: User): string {
    return user.userName;
  }
}