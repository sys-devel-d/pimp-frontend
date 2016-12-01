import { Pipe, PipeTransform } from '@angular/core';
import Room from '../models/room'
import { User } from '../models/user'
import { Globals } from '../commons/globals'

@Pipe({name: 'roomName'})
export class RoomNamePipe implements PipeTransform {
  userName:string;
  constructor() {
      /*
        This needs refactoring. Accessing local storage here is not good.
      */
      const userFromStorage = localStorage.getItem('currentUser');
      if(userFromStorage) {
          this.userName = JSON.parse(localStorage.getItem('currentUser')).userName;
      }
      else {
          this.userName = "SYSTEM";
      }
      
  }

  transform(room: Room): string {
    if(room.roomType == Globals.CHATROOM_TYPE_GROUP) {
        return room.displayNames[Globals.HASH_KEY_DISPLAY_NAME_GROUP];
    }
    // It's a private room
    const otherPerson:User = room.participants.find(p => p.userName != this.userName);
    if(otherPerson) {
        return otherPerson.firstName + " " + otherPerson.lastName
    }
    return '<NO_NAME>'
  }
}