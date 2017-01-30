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
import { Subject } from 'rxjs';
import {
  CalendarEventTimesChangedEvent,
  CalendarEventTitleFormatter
} from 'angular-calendar';
import CalendarModalComponent from './modal/calendar-modal.component';
import EditEventModalComponent from './modal/event/edit-event-modal.component';
import CreateEventModalComponent from './modal/event/create-event-modal.component';
import ReadOnlyEventModalComponent from './modal/event/readonly/readonly-event-modal.component';
import CalendarService from '../services/calendar.service';
import NotificationService from '../services/notification.service'
import { AuthService } from '../services/auth.service';
import { CalEvent, SubscribedCalendar, Calendar } from '../models/base';
import { Globals } from '../commons/globals';
import { CustomEventTitleFormatter } from './custom-event-title-formatter';

type Mode = 'edit-event' | 'create-event' | 'create-calendar' | 'edit-calendar' | 'read-event';

@Component({
  selector: 'angular-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [{
    provide: CalendarEventTitleFormatter,
    useClass: CustomEventTitleFormatter
  }]
})
export class CalendarComponent implements OnInit {

  @ViewChild(CalendarModalComponent) calendarModalComponent: CalendarModalComponent;
  @ViewChild(EditEventModalComponent) editEventModalComponent: EditEventModalComponent;
  @ViewChild(CreateEventModalComponent) createModalComponent: CreateEventModalComponent;

  mode: Mode;
  view: string;
  viewDate: Date;
  activeDayIsOpen: boolean;
  events: CalEvent[] = [];
  private term: string;
  calendarSearchResults: Calendar[] = [];
  private subscribeCallback: Function;

  locale = 'de';
  weekStartsOn = 1;

  constructor(
    private calendarService: CalendarService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService) {
    // TODO: Optimize this! Add a new subsciption for when only one event is added
    this.calendarService.eventsChange.subscribe( (events: CalEvent[]) => {
      this.events = events.slice(0);
    });
    this.calendarService.eventClicked = this.eventClicked.bind(this);
    this.subscribeCallback = this.subscribeCalendar.bind(this);
  }

  ngOnInit() {
    this.events = this.calendarService.getEvents();
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
    else if(!event.isPrivate) {
      this.router.navigate(['calendar', 'event', event.key]);
    }
  }

  eventClickedInMonthView(event: CalEvent) {
    this.viewDate = event.start;
    this.view = 'day';
  }

  filterEventsByCalendars(subscribedCalendars: SubscribedCalendar[]) {
    this.calendarService.filterEventsByCalendars(subscribedCalendars);
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

  eventTimesChanged({event, newStart, newEnd}): void {
    const evt = event;
    evt.start = newStart;
    evt.end = newEnd;
    this.calendarService.editEvent(evt, []);
    this.viewDate = newStart;
  }

  searchCalendar(term) {
   if (this.term.length >= 3) {
      this.calendarService.search(this.term)
        .subscribe(
          (cals: Calendar[]) => this.calendarSearchResults = cals,
          err => console.error(err)
        );
    }
  }

  subscribeCalendar(key: string) {
    this.calendarService.subscribeCal(key);
  }

  private setViewDate(date: Date) {
    this.viewDate = date;
    this.calendarService.setViewDate(date);
  }
}
