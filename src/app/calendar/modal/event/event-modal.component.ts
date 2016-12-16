import { Component } from '@angular/core';
import { hideAppModal, showAppModal } from '../../../commons/dom-functions';
import { CalEvent, Calendar } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import { UserService } from '../../../services/user.service';
import { DateFormatter } from '@angular/common/src/facade/intl';

@Component({
  selector: 'event-modal',
  templateUrl: './event-modal.component.html'
})
export default class EventModalComponent {

  private event: CalEvent = new CalEvent;

  // save the date picked by the ng2-datetime-picker
  private eventStart: Date;
  private eventEnd: Date;

  // show a properly formatted date as a placeholder before a date is picked
  private start: string;
  private end: string;

  constructor(
    private calendarService: CalendarService,
    private userService: UserService
  ) {}

  showDialog(calendarEvent: CalEvent) {
    this.eventStart = null;
    this.eventEnd = null;
    this.event = Object.assign({}, calendarEvent); // avoid UI changes if not saved
    this.start = DateFormatter.format(this.event.start, 'de', 'dd.MM.yyyy HH:mm');
    this.end = DateFormatter.format(this.event.end, 'de', 'dd.MM.yyyy HH:mm');
    showAppModal();
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
      hideAppModal();
    }
  }

  public deleteEvent() {
    this.calendarService.deleteEvent(this.event);
    hideAppModal();
  }

}
