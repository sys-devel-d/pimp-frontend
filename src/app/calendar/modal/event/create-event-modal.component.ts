import { Component } from '@angular/core';
import { CalEvent, Calendar } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import { UserService } from './../../../services/user.service';
import { EventModalAbstract } from './event-modal.abstract';

@Component({
  selector: 'create-event-modal',
  templateUrl: './event-modal.component.html'
})
export default class CreateEventModalComponent extends EventModalAbstract {
  
  private calendars: Calendar[];

  constructor(calendarService: CalendarService, userService: UserService) {
    super(calendarService, userService);
    this.modalTitle = 'Termin erstellen';
    this.calendars = this.calendarService.getWritableCalendars();
  }

  saveAction(event: CalEvent) {
    this.calendarService.createEvent(event);
  }

}
