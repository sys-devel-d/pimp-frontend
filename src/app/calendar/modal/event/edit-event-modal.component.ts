import { Component } from '@angular/core';
import { hideAppModal } from '../../../commons/dom-functions';
import { CalEvent } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import { DateFormatter } from '@angular/common/src/facade/intl';
import { EventModalAbstract } from './event-modal.abstract';
import { Globals } from '../../../commons/globals';

@Component({
  selector: 'event-modal',
  templateUrl: './event-modal.component.html'
})
export default class EditEventModalComponent extends EventModalAbstract {

  calendarTitle: string;

  constructor(calendarService: CalendarService) {
    super(calendarService);
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
    super.showDialog();
  }

  private deleteEvent() {
    if(confirm(Globals.messages.DELETE_EVENT_CONFIRMATION)) {
      this.calendarService.deleteEvent(this.event);
      hideAppModal();
    }
  }

}
