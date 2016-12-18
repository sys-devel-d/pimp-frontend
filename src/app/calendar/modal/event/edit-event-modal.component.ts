import { Component } from '@angular/core';
import { hideAppModal } from '../../../commons/dom-functions';
import { CalEvent, User } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import { UserService } from './../../../services/user.service';
import { DateFormatter } from '@angular/common/src/facade/intl';
import { EventModalAbstract } from './event-modal.abstract';
import { Globals } from '../../../commons/globals';

@Component({
  selector: 'edit-event-modal',
  templateUrl: './event-modal.component.html'
})
export default class EditEventModalComponent extends EventModalAbstract {

  calendarTitle: string;

  constructor(calendarService: CalendarService, userService: UserService) {
    super(calendarService, userService);
    this.modalTitle = 'Termin bearbeiten';
    this.inEditingMode = true;
  }

  saveAction(event: CalEvent) {
    this.calendarService.editEvent(event);
  }

  startPlaceHolder(): string {
    return DateFormatter.format(this.event.start, 'de', 'dd.MM.yyyy HH:mm');
  }

  endPlaceHolder(): string {
    return DateFormatter.format(this.event.end, 'de', 'dd.MM.yyyy HH:mm');
  }

  showDialog(evt: CalEvent) {
    this.eventStart = null;
    this.eventEnd = null;
    this.event = Object.assign({}, evt);
    this.calendarTitle = this.calendarService.getCalendarByKey(evt.calendarKey).title;
    this.selectedUsers = evt.participants.map( part => {
      const u = new User();
      u.userName = part;
      return u;
    });
    super.showDialog();
  }

  private deleteEvent() {
    if(confirm(Globals.messages.DELETE_EVENT_CONFIRMATION)) {
      this.calendarService.deleteEvent(this.event);
      hideAppModal();
    }
  }

}
