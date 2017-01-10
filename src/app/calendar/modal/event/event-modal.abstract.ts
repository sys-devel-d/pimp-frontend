import { CalEvent, User } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import NotificationService from '../../../services/notification.service';
import { UserService } from './../../../services/user.service';
import { hideAppModal, showAppModal, shakeInput, fadeIn, fadeOut } from '../../../commons/dom-functions';

export abstract class EventModalAbstract {
  inEditingMode: boolean;
  modalTitle: string;
  event: CalEvent = new CalEvent();
  users: User[];
  invited: User[] = [];
  declined: User[] = [];
  participants: User[] = [];
  datepickerOpts = {
    //startDate: new Date(),
    autoclose: true,
    todayBtn: 'linked',
    todayHighlight: true,
    language: 'de',
    placeholder: 'Datum'
  }
  timepickerOpts = {
    showMeridian: false,
    defaultTime: 'current',
    placeholder: 'Uhrzeit'
  }

  calendarService: CalendarService;
  userService: UserService;
  notificationService: NotificationService;

  constructor(calendarService: CalendarService, userService: UserService,
  notificationService: NotificationService) {
    this.calendarService = calendarService;
    this.userService = userService;
    this.event.start = new Date();
    this.notificationService = notificationService;
  }

  showDialog(evt?: CalEvent) {
    this.userService.getAllUsers().subscribe( users => {
      this.users = users;
    });
    showAppModal();
  }

  abstract saveAction(event: CalEvent): void;
  abstract updateEndDate(startDate: Date): void;

  saveEvent() {
    const e = this.event;
    if (!(e.title && /\S/.test(e.title))) {
      return shakeInput('#eventTitle');
    }
    if (!e.calendarKey) {
      return shakeInput('#calendarKey');
    }

    if(e.allDay) {
      //e.end = new Date();
      //e.end.setTime(e.start.getTime());
      e.end.setHours(23);
      e.end.setMinutes(59);
      e.start.setHours(0);
      e.start.setMinutes(0);
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

    e.invited = this.invited.map( usr => usr.userName);

    this.saveAction(e);
    hideAppModal();
    this.event = new CalEvent();
  }

  private displayUser(user: User): string {
    return user.userName;
  }

  private onSelectedUsersUpdate(users: User[]) {
    this.invited = users;
  }

  private getTimePickerOpts() {
    if(this.event.allDay) {
      fadeOut('.timepicker');
    }
    else {
      fadeIn('.timepicker');
    }
    return this.timepickerOpts;
  }
}