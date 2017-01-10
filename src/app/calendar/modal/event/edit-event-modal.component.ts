import { Component } from '@angular/core';
import { hideAppModal } from '../../../commons/dom-functions';
import { CalEvent, User } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import NotificationService from '../../../services/notification.service';
import { UserService } from './../../../services/user.service';
import { EventModalAbstract } from './event-modal.abstract';
import { Globals } from '../../../commons/globals';

@Component({
  selector: 'edit-event-modal',
  templateUrl: './event-modal.component.html'
})
export default class EditEventModalComponent extends EventModalAbstract {

  calendarTitle: string;
  alreadyInvitedUsers: string[];

  constructor(calendarService: CalendarService, userService: UserService,
  notificationService: NotificationService) {
    super(calendarService, userService, notificationService);
    this.modalTitle = 'Termin bearbeiten';
    this.inEditingMode = true;
  }

  saveAction(event: CalEvent) {
    const newlyInvitedUsers = event.invited.filter( user => {
      return this.alreadyInvitedUsers.indexOf(user) === -1;
    });
    this.calendarService.editEvent(event, newlyInvitedUsers);
  }

  userMapFunc(userName: string) {
    const u = new User();
    u.userName = userName;
    return u;
  }

  showDialog(evt: CalEvent) {
    this.event = Object.assign({}, evt);
    this.calendarTitle = this.calendarService.getCalendarByKey(evt.calendarKey).title;
    this.participants = evt.participants.map(this.userMapFunc);
    this.invited = evt.invited.map(this.userMapFunc);
    this.declined = evt.declined.map(this.userMapFunc);
    this.alreadyInvitedUsers = this.invited.map(u => u.userName);
    super.showDialog();
  }

  private deleteEvent() {
    if(confirm(Globals.messages.DELETE_EVENT_CONFIRMATION)) {
      this.calendarService.deleteEvent(this.event);
      hideAppModal();
    }
  }

  updateEndDate(startDate: Date) {}

}
