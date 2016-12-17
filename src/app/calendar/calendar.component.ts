import { Component, OnInit, ViewChild } from '@angular/core';
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
import CalendarModalComponent from './modal/calendar-modal.component';
import EventModalComponent from './modal/event/event-modal.component';
import CreateEventModalComponent from './modal/event/create/create-event-modal.component';
import CalendarService from '../services/calendar.service';
import { CalEvent } from '../models/base';

type Mode = 'edit-event' | 'create-event' | 'create-calendar' | 'edit-calendar';

@Component({
  selector: 'angular-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  @ViewChild(CalendarModalComponent) calendarModalComponent: CalendarModalComponent;
  @ViewChild(EventModalComponent) eventModalComponent: EventModalComponent;
  @ViewChild(CreateEventModalComponent) createModalComponent: CreateEventModalComponent;

  mode: Mode;
  view: string = 'month';
  viewDate: Date;
  activeDayIsOpen: boolean;
  refresh: Subject<any> = new Subject(); // Why? How?
  events: CalEvent[] = [];
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({event}: {event: CalEvent}): void => {
        this.eventClicked(event);
      }
    }, 
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({event}: {event: CalEvent}): void => {
        this.calendarService.deleteEvent(event);
      }
    }
  ];

  constructor(private calendarService: CalendarService) {
    this.calendarService.eventsChange.subscribe( (events:CalEvent[]) => {
      this.events = events.map(event => {event.actions = this.actions; return event;});
    });
  }

  ngOnInit() {
    this.events = this.calendarService.getEvents();
    this.events = this.events.map(event => {event.actions = this.actions; return event;});
    this.viewDate = this.calendarService.getViewDate();
    this.view = this.calendarService.getView();
    this.activeDayIsOpen = this.calendarService.getActiveDayIsOpen();
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
    this.mode = 'edit-event';
    setTimeout(() => {
      this.eventModalComponent.showDialog(event);
    }, 0);
  }

  createCalendarClicked() {
    this.mode = 'create-calendar';
    setTimeout(() => {
      this.calendarModalComponent.showDialog();
    }, 0);
  }

  createEventClicked() {
    this.mode = 'create-event';
    setTimeout(() => {
      this.createModalComponent.showDialog();
    }, 0);
  }

  eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next();
  }
}
