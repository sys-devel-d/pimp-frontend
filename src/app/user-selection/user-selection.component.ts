import { Component, Input } from '@angular/core';
import { User } from '../models/base';

@Component({
  selector: 'user-selection',
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.scss']
})
export default class UserSelectionComponent {
  
  @Input() private canRemoveUsers: boolean;
  @Input() private users: User[];
  @Input() private selectedUsers: User[];
  @Input() private displayUser: Function;
  @Input() private displaySelectedUser: Function;

  addToSelectedUsers(user: User) {
    if (!this.selectedUsers.find(usr => usr.userName === user.userName)) {
      this.selectedUsers.push(user);
    }
  }

  private removeFromSelectedUsers(user: User) {
    this.selectedUsers =
      this.selectedUsers.filter(usr => usr.userName !== user.userName);
  }

}