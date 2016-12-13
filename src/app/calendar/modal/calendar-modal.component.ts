import {Component} from '@angular/core';
import {showCalendarModal, hideCalendarModal} from '../../commons/dom-functions';
import {CalEvent, Calendar} from '../../models/base';
import CalendarService from '../../services/calendar.service';
import {UserService} from '../../services/user.service';
import {DateFormatter} from '@angular/common/src/facade/intl';

@Component({
  selector: 'calendar-modal',
  templateUrl: 'calendar-modal.component.html',
  styleUrls: ['calendar-modal.component.css']
})
export default class CalendarModalComponent {

  private event: CalEvent = new CalEvent;
  private calendar: Calendar = new Calendar;

  // save the date picked by the ng2-datetime-picker
  private eventStart: Date;
  private eventEnd: Date;

  // show a properly formatted date as a placeholder before a date is picked
  private start: string;
  private end: string;

  private isEvent: Boolean;

  constructor(
    private calendarService: CalendarService,
    private userService: UserService
  ) {

  }

  showDialog(isEvent: Boolean, calendarEvent?: CalEvent) {
    this.isEvent = isEvent;
    if (isEvent) {
      this.eventStart = null;
      this.eventEnd = null;
      if (calendarEvent) {
        this.event = Object.assign({}, calendarEvent); // avoid UI changes if not saved
        this.start = DateFormatter.format(this.event.start, 'de', 'dd.MM.yyyy hh:mm');
        this.end = DateFormatter.format(this.event.end, 'de', 'dd.MM.yyyy hh:mm');
      }
    }
    showCalendarModal();
  }

  public saveEvent() {
    if (this.eventStart != null) {
      this.event.start = this.eventStart;
    }
    if (this.eventEnd != null) {
      this.event.end = this.eventEnd;
    }
    if (this.event.start <= this.event.end) {
      this.calendarService.editEvent(this.event);
      hideCalendarModal();
    }
  }

  public deleteEvent() {
    this.calendarService.deleteEvent(this.event);
    hideCalendarModal();
  }

  public createCalendar() {
    this.calendar.owner = this.userService.currentUser.userName;
    this.calendarService.createNewCalendar(this.calendar);
    // reinitialize to clear forms
    this.calendar = new Calendar();
  }
}
