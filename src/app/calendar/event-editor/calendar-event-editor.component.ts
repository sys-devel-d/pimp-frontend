import {Component} from "@angular/core";
import {showCalendarEventEditorModal, hideCalendarEventEditorModal} from "../../commons/dom-functions";
import {CalEvent} from "../../models/base";
import CalendarService from "../../services/calendar.service";
import {DateFormatter} from "@angular/common/src/facade/intl";

@Component({
  selector: 'calendar-event-editor',
  templateUrl: 'calendar-event-editor.component.html',
  styleUrls: ['calendar-event-editor.component.css']
})
export default class CalendarEventEditorComponent {

  private event: CalEvent = new CalEvent;

  // save the date picked by the ng2-datetime-picker
  private eventStart: Date;
  private eventEnd: Date;

  // show a properly formatted date as a placeholder before a date is picked
  private start: string;
  private end: string;

  constructor(private calendarService: CalendarService) {

  }

  showDialog(calendarEvent?: CalEvent) {
    this.eventStart = null;
    this.eventEnd = null;
    if(calendarEvent) {
      this.event = this.clone(calendarEvent); // avoid UI changes if not saved
      this.start = DateFormatter.format(this.event.start, 'de', 'dd.MM.yyyy hh:mm');
      this.end = DateFormatter.format(this.event.end, 'de', 'dd.MM.yyyy hh:mm');
    }
    showCalendarEventEditorModal();
  }

  public saveEvent() {
    if(this.eventStart != null) {
      this.event.start = this.eventStart;
    }
    if(this.eventEnd != null) {
      this.event.end = this.eventEnd;
    }
    if(this.event.start <= this.event.end) {
      this.calendarService.editEvent(this.event);
      hideCalendarEventEditorModal();
    }
  }

  public deleteEvent() {
    this.calendarService.deleteEvent(this.event);
    hideCalendarEventEditorModal();
  }

  private clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    let copy = obj.constructor();
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
}
