import { Component } from '@angular/core';
import { hideAppModal, showAppModal, shakeInput } from '../../../commons/dom-functions';
import { CalEvent } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
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

  constructor(private calendarService: CalendarService) {}

  showDialog(calendarEvent: CalEvent) {
    this.eventStart = null;
    this.eventEnd = null;
    this.event = calendarEvent;
    this.start = DateFormatter.format(this.event.start, 'de', 'dd.MM.yyyy HH:mm');
    this.end = DateFormatter.format(this.event.end, 'de', 'dd.MM.yyyy HH:mm');
    showAppModal();
  }

  public saveEvent() {
    if (!( this.event.title && /\S/.test(this.event.title) )) {
      shakeInput('#eventTitle');
      return;
    }
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
    else {
      alert('Der Beginn des Termins kann zeitlich nicht vor dem Ende sein.');
    }
  }

  public deleteEvent() {
    this.calendarService.deleteEvent(this.event);
    hideAppModal();
  }

}
