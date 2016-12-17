import { Component, OnInit } from '@angular/core';
import { hideAppModal, showAppModal, shakeInput } from '../../../../commons/dom-functions';
import { CalEvent, Calendar } from '../../../../models/base';
import CalendarService from '../../../../services/calendar.service';
import { DateFormatter } from '@angular/common/src/facade/intl';

@Component({
  selector: 'create-event-modal',
  templateUrl: './create-event-modal.component.html'
})
export default class CreateEventModalComponent implements OnInit {

  private event: CalEvent = new CalEvent();
  private calendars: Calendar[];

  constructor(private calendarService: CalendarService) {}

  showDialog() {
    showAppModal();
  }

  ngOnInit() {
    this.calendars = this.calendarService.getWritableCalendars();
  }

  public saveEvent() {
    const e = this.event;
    if ( !(e.title && /\S/.test(e.title)) ) {
      return shakeInput('#eventTitle');
    }
    if(!e.calendarKey) {
      return shakeInput('#calendarKey');
    }

    if(e.start > e.end) {
      alert('Der Beginn des Termins kann zeitlich nicht vor dem Ende sein.');
      return;
    }
    if(e.isPrivate === undefined) {
      e.isPrivate = false;
    }
    this.calendarService.createEvent(e);
    hideAppModal();
    this.event = new CalEvent();
  }

}
