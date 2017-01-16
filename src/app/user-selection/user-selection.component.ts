import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../models/base';

@Component({
  selector: 'user-selection',
  templateUrl: './user-selection.component.html'
})
export default class UserSelectionComponent {
  
  @Input() private canRemoveUsers: boolean;
  @Input() private users: User[];
  @Input() private selectedUsers: User[];
  @Input() private displayUser: Function;
  @Input() private displaySelectedUser: Function;
  @Output() private update: EventEmitter<User[]> = new EventEmitter<User[]>();

  addToSelectedUsers(user: User) {
    if (!this.selectedUsers.find(usr => usr.userName === user.userName)) {
      this.selectedUsers.push(user);
    }
    this.update.emit(this.selectedUsers);
  }

  private removeFromSelectedUsers(user: User) {
    this.selectedUsers =
      this.selectedUsers.filter(usr => usr.userName !== user.userName);
    this.update.emit(this.selectedUsers);
  }
}