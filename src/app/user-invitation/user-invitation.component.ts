import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../models/base';

@Component({
  selector: 'user-invitation',
  templateUrl: './user-invitation.component.html',
  styles: ['.select-action { color: lightsalmon; }']
})
export default class UserInvitationComponent {
  
  @Input() private canRemoveUsers: boolean;
  @Input() private users: User[];
  @Input() private invited: User[];
  @Input() private declined: User[];
  @Input() private participants: User[];
  @Input() private displayUser: Function;
  @Output() private update: EventEmitter<User[]> = new EventEmitter<User[]>();

  addToInvitedUsers(user: User) {
    if (!this.invited.find(usr => usr.userName === user.userName)) {
      if(this.declined.find(decl => decl.userName === user.userName)) {
        alert(`Sie können diesen Benutzer nicht erneut einladen. ${user.userName} hat bereits abgesagt`);
        return;
      }
      this.invited.push(user);
      this.update.emit(this.invited);
    }
    
  }

  private removeFromInvitedUsers(user: User) {
    this.invited =
      this.invited.filter(usr => usr.userName !== user.userName);
    this.update.emit(this.invited);
  }
}