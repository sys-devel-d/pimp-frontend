import { Component, OnInit } from '@angular/core';
import {Component, ViewChild} from '@angular/core';
import {
  subDays,
  addDays,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from 'date-fns';
import { Subject } from 'rxjs/Subject';
import {
  CalendarEventAction,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';
import CalendarEventEditorComponent from "./event-editor/calendar-event-editor.component";

const colors: any = {
  red:    { primary: '#ad2121', secondary: '#FAE3E3' },
  blue:   { primary: '#1e90ff', secondary: '#D1E8FF' },
  yellow: { primary: '#e3bc08', secondary: '#FDF1BA' }
};
import CalendarService from '../services/calendar.service';
import { CalEvent } from '../models/base';

@Component({
  selector: 'angular-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  @ViewChild(CalendarEventEditorComponent) calendarEventEditor: CalendarEventEditorComponent;

  private calendarEventEditorCallback: Function;

  view: string = 'month';
  view: string;
  viewDate: Date;
  activeDayIsOpen: boolean;
  actions: CalendarEventAction[] = []; // What's this???
  refresh: Subject<any> = new Subject(); // Why? How?
  events: CalEvent[] = [];

  constructor(private calendarService: CalendarService) {
    this.calendarService.eventsChange.subscribe( (events:CalEvent[]) => {
      this.events = events;
    });
  }

  ngOnInit() {
    this.events = this.calendarService.getEvents();
    this.viewDate = this.calendarService.getViewDate();
    this.view = this.calendarService.getView();
    this.activeDayIsOpen = this.calendarService.getActiveDayIsOpen();
  }
  activeDayIsOpen: boolean = true;

  actions: CalendarEventAction[] = [{
    label: '<i class="fa fa-fw fa-pencil"></i>',
    onClick: ({event}: {event: CalendarEvent}): void => {
      this.openCalendarEventEditor();
    }
  }, {
    label: '<i class="fa fa-fw fa-times"></i>',
    onClick: ({event}: {event: CalendarEvent}): void => {
      this.events = this.events.filter(e => e !== event);
    }
  }];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [{
    start: new Date(2016, 10, 29, 12, 15),
    end: new Date(2016, 10, 29, 13, 0),
    title: 'Spring Präsentation',
    color: colors.red,
    actions: this.actions
  }, {
    start: new Date(2016, 10, 15),
    end: new Date(2016, 10, 29),
    title: 'Zweiter Sprint',
    color: colors.yellow,
    actions: this.actions
  }];

  constructor() {
    this.calendarEventEditorCallback = this.openCalendarEventEditor.bind(this);
  }

  increment(): void {
    const addFn: any = {
      day: addDays,
      week: addWeeks,
      month: addMonths
    }[this.view];
    this.viewDate = addFn(this.viewDate, 1);
  }

  decrement(): void {
    const subFn: any = {
      day: subDays,
      week: subWeeks,
      month: subMonths
    }[this.view];
    this.viewDate = subFn(this.viewDate, 1);
  }

  today(): void {
    this.viewDate = new Date();
  }

  dayClicked({date, events}: {date: Date, events: CalEvent[]}): void {
    if (isSameMonth(date, this.viewDate)) {
      if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventClicked(event: CalEvent) {
    // Open some form that allows editing of the event.
    console.log(event);
  }

  eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next();
  }

  private openCalendarEventEditor() {
    this.calendarEventEditor.showDialog();
  }
}
