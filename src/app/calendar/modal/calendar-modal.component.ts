import {Component} from '@angular/core';
import {hideAppModal, showAppModal, shakeInput} from '../../commons/dom-functions';
import {Calendar} from '../../models/base';
import CalendarService from '../../services/calendar.service';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'calendar-modal',
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.css']
})
export default class CalendarModalComponent {

  private calendar: Calendar = new Calendar;

  constructor(
    private calendarService: CalendarService,
    private userService: UserService
  ) {}

  showDialog() {
    showAppModal();
  }

  public createCalendar() {
    if (this.calendar.title && /\S/.test(this.calendar.title)) {
      this.calendar.owner = this.userService.currentUser.userName;
      this.calendar.events = [];
      this.calendarService.createNewCalendar(this.calendar);
      // reinitialize to clear forms
      this.calendar = new Calendar();
      hideAppModal();
    }
    else {
      shakeInput('#calendarTitle');
    }


  }
}
