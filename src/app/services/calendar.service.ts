import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { AuthService } from './auth.service';
import { CalEvent, Calendar } from '../models/base';
import { Subject } from 'rxjs';
import {DateFormatter} from "@angular/common/src/facade/intl";

const colors: any = {
  red: { primary: '#ad2121', secondary: '#FAE3E3' },
  blue: { primary: '#1e90ff', secondary: '#D1E8FF' },
  yellow: { primary: '#e3bc08', secondary: '#FDF1BA' }
};

@Injectable()
export default class CalendarService {

  isInitialized = false;
  private viewDate: Date = new Date();
  private view: string = 'month';
  private activeDayIsOpen: boolean = true;
  private events: CalEvent[] = [];
  private calendars: Calendar[];
  eventsChange: Subject<CalEvent[]> = new Subject<CalEvent[]>();

  constructor(private authService: AuthService, private http: Http) {}

  init() {
    if (!this.isInitialized) {
      this.fetchUsersCalendars();
    }
  }

  /*
  Function maps a calendar's events coming from server
  so they are in the right format
  */
  private mapCalendarEvents(calendar: Calendar): Calendar {
    calendar.events = calendar.events.map(this.mapEventForFrontend);
    return calendar;
  }

  private fetchUsersCalendars() {
    return this.http.get(
      Globals.BACKEND + 'calendar',
      { headers: this.authService.getTokenHeader() }
    ).map((res: Response) => {
      return res.json() as Calendar[]
    }).subscribe((calendars: Calendar[]) => {
      // Bring calendars and their events in the correct format
      this.calendars = calendars.map(cal => this.mapCalendarEvents(cal));
      // Produce one array of events by concatenating all of the calendar's events
      this.events = this.calendars
        .map(cal => cal.events)
        .reduce((a, b) => a.concat(b), []);
      /* Inform subscribers (CalendarComponent)
      that events have changed, so the UI updates. */
      this.eventsChange.next(this.events);
      this.isInitialized = true;
    });
  }

  createNewCalendar(calendar: Calendar) {
    return this.http.post(
      Globals.BACKEND + 'calendar',
      calendar,
      { headers: this.authService.getTokenHeader() }
    )
    .map( res => res.json() as Calendar )
    .subscribe( (cal: Calendar) => {
      this.calendars.push(cal);
    });
  }

  getEvents(): CalEvent[] {
    return this.events;
  }

  /**
   * Returns all calendars that the user can write to.
   * Basically he shouldn't be able to write in other 
   * users' private calendars.
   */
  getWritableCalendars(): Calendar[] {
    return this.calendars.filter( cal =>
      cal.owner === this.authService.getCurrentUserName()
    );
  }

  getCalendarByKey(key: string): Calendar {
    return this.calendars.find(c => c.key === key);
  }

  getViewDate(): Date {
    return this.viewDate;
  }

  setViewDate(d: Date) {
    this.viewDate = d;
  }

  getView(): string {
    return this.view;
  }

  setView(view: string) {
    this.view = view;
  }

  getActiveDayIsOpen(): boolean {
    return this.activeDayIsOpen;
  }

  createEvent(event: CalEvent) {
    event.creator = this.authService.getCurrentUserName();
    this.http.post(
      Globals.BACKEND + 'calendar/' + event.calendarKey,
      this.mapEventForBackend(event),
      { headers: this.authService.getTokenHeader() }
    ).map(response => response.json())
    .subscribe( (evt: CalEvent) => {
      evt = this.mapEventForFrontend(evt);
      this.calendars.find(cal => cal.key === evt.calendarKey).events.push(evt);
      this.events.push(evt);
      this.eventsChange.next(this.events);
    });
  }

  editEvent(event: CalEvent) {
    this.http.put(
      Globals.BACKEND + 'calendar/event/' + event.key,
      this.mapEventForBackend(event),
      {
        headers: this.authService.getTokenHeader()
      }
    ).subscribe(
      response => {
        this.events = this.events.map(evt => evt.key === event.key ? event : evt);
        this.eventsChange.next(this.events);
      },
      err => console.log(err)
    )
  }

  deleteEvent(event: any) {
    this.http.delete(
      Globals.BACKEND + 'calendar/event/' + event.key,
      {
        headers: this.authService.getTokenHeader(),
        body: this.mapEventForBackend(event)
      }
    ).subscribe(
      () => {
        this.events = this.events.filter(evt => evt.key !== event.key);
        this.eventsChange.next(this.events);
      },
      err => console.log(err)
    )
  }

  private mapEventForBackend(event: CalEvent): any {
    const evt: any = Object.assign({}, event)
    delete evt.color;
    delete evt.actions;
    evt.start = DateFormatter.format(event.start, 'de', 'yyyy-MM-dd HH:mm');
    evt.end = DateFormatter.format(event.end, 'de', 'yyyy-MM-dd HH:mm');
    return evt;
  }

  private mapEventForFrontend(evt: any): CalEvent {
    evt.start = new Date(evt.start);
    evt.end = new Date(evt.end);
    evt.color = evt.isPrivate ? colors.red : colors.blue;
    return evt;
  }

  tearDown() {
    this.isInitialized = false;
    this.events = [];
    this.calendars = [];
  }
}