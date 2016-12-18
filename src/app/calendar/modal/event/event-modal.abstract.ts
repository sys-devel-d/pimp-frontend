import { CalEvent } from '../../../models/base';
import CalendarService from '../../../services/calendar.service';
import { hideAppModal, showAppModal, shakeInput } from '../../../commons/dom-functions';

export abstract class EventModalAbstract {
  inEditingMode: boolean;
  modalTitle: string;
  event: CalEvent = new CalEvent();

  // save the date picked by the ng2-datetime-picker
  eventStart: Date;
  eventEnd: Date;

  calendarService: CalendarService;

  constructor(calendarService: CalendarService) {
    this.calendarService = calendarService;
  }

  showDialog(evt?: CalEvent) {
    showAppModal();
  }

  abstract saveAction(event: CalEvent): void;
  abstract startPlaceHolder(): string;
  abstract endPlaceHolder(): string;

  saveEvent() {
    const e = this.event;
    if (!(e.title && /\S/.test(e.title))) {
      return shakeInput('#eventTitle');
    }
    if (!e.calendarKey) {
      return shakeInput('#calendarKey');
    }

    if(e.allDay) {
      this.eventEnd = new Date();
      this.eventEnd.setTime(this.eventStart.getTime());
      this.eventEnd.setHours(23);
      this.eventEnd.setMinutes(59);
    }

    if (this.eventStart > this.eventEnd) {
      return alert('Der Beginn des Termins kann zeitlich nicht vor dem Ende sein.');
    }

    if (this.eventStart != null) {
      this.event.start = this.eventStart;
    }
    if (this.eventEnd != null) {
      this.event.end = this.eventEnd;
    }

    if (e.isPrivate === undefined) {
      e.isPrivate = false;
    }
    if (e.allDay === undefined) {
      e.allDay = false;
    }

    this.saveAction(e);
    hideAppModal();
    this.event = new CalEvent();
  }
}