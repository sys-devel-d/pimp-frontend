import { Component } from '@angular/core';
import { CalEvent, Calendar, Notification } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import NotificationService from '../../../services/notification.service';
import { UserService } from './../../../services/user.service';
import { EventModalAbstract } from './event-modal.abstract';

@Component({
  selector: 'create-event-modal',
  templateUrl: './event-modal.component.html'
})
export default class CreateEventModalComponent extends EventModalAbstract {
  
  private calendars: Calendar[];

  constructor(calendarService: CalendarService, userService: UserService,
  notificationService: NotificationService) {
    super(calendarService, userService, notificationService);
    this.modalTitle = 'Termin erstellen';
    this.calendars = this.calendarService.getWritableCalendars();
  }

  saveAction(event: CalEvent) {
    this.calendarService.createEvent(event);
  }

  // Everytime the start date get updated make the enddate one hour later
  updateEndDate(startDate: Date) {
    if(startDate) {
      const newDate = new Date(startDate.getTime());
      newDate.setTime(newDate.getTime() + 60*60*1000);
      this.event.end = newDate;
    }
  }
  
}
