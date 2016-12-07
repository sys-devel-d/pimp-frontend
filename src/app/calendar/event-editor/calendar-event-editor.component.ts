import { Component } from '@angular/core';
import {showCalendarEventEditorModal} from "../../commons/dom-functions";

@Component({
  selector: 'calendar-event-editor',
  templateUrl: 'calendar-event-editor.component.html',
  styleUrls: ['calendar-event-editor.component.css']
})
export default class CalendarEventEditorComponent {

  constructor() { }

  showDialog() {
    showCalendarEventEditorModal();
  }
}
