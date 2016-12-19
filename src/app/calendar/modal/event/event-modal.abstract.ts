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
  datepickerOpts = {
    //startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    format: 'D, dd. MM. yyyy',
    language: 'de' // TODO: not working
  }
  timepickerOpts = {
    showMeridian: false,
    defaultTime: 'current'
  }

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

  saveEvent() {
    const e = this.event;
    if (!(e.title && /\S/.test(e.title))) {
      return shakeInput('#eventTitle');
    }
    if (!e.calendarKey) {
      return shakeInput('#calendarKey');
    }

    if(e.allDay) {
      e.end = new Date();
      e.end.setTime(e.start.getTime());
      e.end.setHours(23);
      e.end.setMinutes(59);
    }

    if (e.start > e.end) {
      return alert('Der Beginn des Termins kann zeitlich nicht vor dem Ende sein.');
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