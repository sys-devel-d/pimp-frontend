import { Component } from '@angular/core';
import { CalEvent, Calendar } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import { EventModalAbstract } from './event-modal.abstract';

@Component({
  selector: 'create-event-modal',
  templateUrl: './event-modal.component.html'
})
export default class CreateEventModalComponent extends EventModalAbstract {
  
  private calendars: Calendar[];

  constructor(calendarService: CalendarService) {
    super(calendarService);
    this.modalTitle = 'Termin erstellen';
    this.calendars = this.calendarService.getWritableCalendars();
  }

  saveAction(event: CalEvent) {
    this.calendarService.createEvent(event);
  }

  startPlaceHolder(): string {
    return (this.event.allDay ? 'Tag' : 'Beginn') + ' des Termins';
  }

  endPlaceHolder(): string {
    return 'Ende des Termins';
  }

}
