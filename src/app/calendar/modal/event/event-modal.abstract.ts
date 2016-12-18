import { CalEvent, User } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import { UserService } from './../../../services/user.service';
import { hideAppModal, showAppModal, shakeInput } from '../../../commons/dom-functions';

export abstract class EventModalAbstract {
  inEditingMode: boolean;
  modalTitle: string;
  event: CalEvent = new CalEvent();
  users: User[];
  selectedUsers: User[] = [];
  
  // save the date picked by the ng2-datetime-picker
  eventStart: Date;
  eventEnd: Date;

  calendarService: CalendarService;
  userService: UserService;

  constructor(calendarService: CalendarService, userService: UserService) {
    this.calendarService = calendarService;
    this.userService = userService;
  }

  showDialog(evt?: CalEvent) {
    this.userService.getAllUsers().subscribe( users => {
      this.users = users;
    });
    showAppModal();
  }

  abstract saveAction(event: CalEvent): void;
  abstract startPlaceHolder(): string;
  abstract endPlaceHolder(): string;

  saveEvent() {
    const e = this.event;
    if (!(e.title && /\S/.test(e.title))) {
      return shakeInput('#eventTitle');
    }
    if (!e.calendarKey) {
      return shakeInput('#calendarKey');
    }

    if (this.eventStart > this.eventEnd) {
      return alert('Der Beginn des Termins kann zeitlich nicht vor dem Ende sein.');
    }

    if (this.eventStart != null) {
      if(e.allDay) {
        this.eventEnd = new Date();
        this.eventEnd.setTime(this.eventStart.getTime());
        this.eventEnd.setHours(23);
        this.eventEnd.setMinutes(59);
      }
      this.event.start = this.eventStart;
    }
    if (this.eventEnd != null) {
      this.event.end = this.eventEnd;
    }

    if (e.isPrivate === undefined) {
      e.isPrivate = false;
    }
    if (e.allDay === undefined) {
      e.allDay = false;
    }

    e.participants = this.selectedUsers.map( usr => usr.userName);

    this.saveAction(e);
    hideAppModal();
    this.event = new CalEvent();
  }

  private displayUser(user: User): string {
    return user.userName;
  }

  private onSelectedUsersUpdate(users: User[]) {
    this.selectedUsers = users;
  }
}