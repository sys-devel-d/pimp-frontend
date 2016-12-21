import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
import { Subject, Subscription, Observable } from 'rxjs';
import {
  CalendarEventAction,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';
import CalendarModalComponent from './modal/calendar-modal.component';
import EditEventModalComponent from './modal/event/edit-event-modal.component';
import CreateEventModalComponent from './modal/event/create-event-modal.component';
import ReadOnlyEventModalComponent from './modal/event/readonly/readonly-event-modal.component';
import CalendarService from '../services/calendar.service';
import { AuthService } from '../services/auth.service';
import { CalEvent } from '../models/base';
import { Globals } from '../commons/globals';

type Mode = 'edit-event' | 'create-event' | 'create-calendar' | 'edit-calendar' | 'read-event';

@Component({
  selector: 'angular-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  @ViewChild(CalendarModalComponent) calendarModalComponent: CalendarModalComponent;
  @ViewChild(EditEventModalComponent) editEventModalComponent: EditEventModalComponent;
  @ViewChild(CreateEventModalComponent) createModalComponent: CreateEventModalComponent;

  mode: Mode;
  view: string;
  viewDate: Date;
  activeDayIsOpen: boolean;
  refresh: Subject<any> = new Subject(); // Why? How?
  events: CalEvent[] = [];
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({event}: { event: CalEvent }): void => {
        this.eventClicked(event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({event}: { event: CalEvent }): void => {
        if (confirm(Globals.messages.DELETE_EVENT_CONFIRMATION)) {
          this.calendarService.deleteEvent(event);
        }
      }
    }
  ];

  constructor(
    private calendarService: CalendarService,
    private authService: AuthService,
    private router: Router) {
    // TODO: Optimize this! Add a new subsciption for when only one event is added
    this.calendarService.eventsChange.subscribe((events: CalEvent[]) => {
      this.events = events.map(evt => this.eventMapping(evt));
    });
  }

  private eventMapping(evt: CalEvent): CalEvent {
    if (evt.creator === this.authService.getCurrentUserName()) {
      evt.actions = this.actions;
    }
    return evt;
  }

  ngOnInit() {
    this.events = this.calendarService.getEvents().map(evt => this.eventMapping(evt));
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
    this.setViewDate(addFn(this.viewDate, 1));
  }

  decrement(): void {
    const subFn: any = {
      day: subDays,
      week: subWeeks,
      month: subMonths
    }[this.view];
    this.setViewDate(subFn(this.viewDate, 1));
  }

  today(): void {
    this.viewDate = new Date();
    this.calendarService.setViewDate(this.viewDate);
  }

  dayClicked({date, events}: { date: Date, events: CalEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.setViewDate(date);
      }
    }
  }

  eventClicked(event: CalEvent) {
    const eventIsWritable = event.creator === this.authService.getCurrentUserName();
    this.mode = eventIsWritable ? 'edit-event' : 'read-event';
    if (eventIsWritable) {
      setTimeout(() => {
        this.editEventModalComponent.showDialog(event);
      }, 0);
    }
    else {
      this.router.navigate(['calendar', 'event', event.key]);
    }
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

  private setViewDate(date: Date) {
    this.viewDate = date;
    this.calendarService.setViewDate(date);
  }
}
