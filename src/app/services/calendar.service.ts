import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { AuthService } from './auth.service';
import { CalEvent, Calendar, SubscribedCalendar } from '../models/base';
import { Observable, Subject } from 'rxjs';
import {DateFormatter} from "@angular/common/src/facade/intl";

const colors: any = {
  red: { primary: '#ad2121', secondary: '#FAE3E3' },
  blue: { primary: '#1e90ff', secondary: '#D1E8FF' },
  yellow: { primary: '#e3bc08', secondary: '#FDF1BA' }
};

@Injectable()
export default class CalendarService {

  private isInitialized = false;
  private viewDate: Date = new Date();
  private view: string = 'month';
  private activeDayIsOpen: boolean = true;
  private events: CalEvent[] = [];
  private allEvents: CalEvent[] = [];
  private calendars: Calendar[] = [];
  private subscribedCals: SubscribedCalendar[] = [];

  eventsChange: Subject<CalEvent[]> = new Subject<CalEvent[]>();
  calendarsChange: Subject<Calendar[]> = new Subject<Calendar[]>();

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
      this.isInitialized = true;
      // Bring calendars and their events in the correct format
      this.calendars = calendars.map(cal => this.mapCalendarEvents(cal));
      // Produce one array of events by concatenating all of the calendar's events
      this.events = this.calendars
        .map(cal => cal.events)
        .reduce((a, b) => a.concat(b), []);
      this.calendars.forEach(cal => this.subscribedCals.push(
        {key: cal.key, title: cal.title, subscribed: true}
      ));
      this.calendarsChange.next(this.calendars);
      /* Inform subscribers (CalendarComponent)
      that events have changed, so the UI updates. */
      this.eventsChange.next(this.events);
    });
  }

  createNewCalendar(calendar: Calendar) {
    return this.http.post(
      Globals.BACKEND + 'calendar',
      calendar,
      { headers: this.authService.getTokenHeader() }
    ).map( res => res.json() as Calendar )
    .subscribe( (cal: Calendar) => {
      this.calendars.push(cal);
      this.calendarsChange.next([calendar]);
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
    return this.calendars.filter( cal => {
      return !( cal.isPrivate && 
                cal.owner !== this.authService.getCurrentUserName()
              );
    });
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
    )
    .map(response => response.json())
    .subscribe( (evt: CalEvent) => {
      evt = this.mapEventForFrontend(evt);
      let calendar: Calendar = this.calendars
        .find(cal => cal.key === evt.calendarKey);
      calendar.events.push(evt);
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
    );
  }

  search(term: string) {
    return this.http
      .get(
        Globals.BACKEND + 'calendar/search/' + term,
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => {
        return res.json();
      })
      .catch((error: any) => Observable
        .throw(error.json()
          ? error.json().error
          : 'Server error while searching for calendar.'));
  }

  subscribeCal(key: string) {
    return this.http
      .patch(
        Globals.BACKEND + 'calendar/subscribe/' + key,
        {},
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => {
        return res.json();
      })
      .subscribe(
        calendars => this.initCalendars(calendars)
      );
  }

  unsubscribe(key: string) {
    return this.http
      .patch(
        Globals.BACKEND + 'calendar/unsubscribe/' + key,
        {},
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => {
        return res.json();
      })
      .subscribe(
        calendars => this.initCalendars(calendars)
      );
  }

  private initCalendars(calendars: Calendar[]) {
    // Bring calendars and their events in the correct format
    this.calendars = calendars.map(cal => this.mapCalendarEvents(cal));
    // Produce one array of events by concatenating all of the calendar's events
    this.events = this.calendars
      .map(cal => cal.events)
      .reduce((a, b) => a.concat(b), []);
    this.subscribedCals = [];
    this.calendars.forEach(cal => this.subscribedCals.push(
      {key: cal.key, title: cal.title, subscribed: true}
    ));
    this.calendarsChange.next(this.calendars);
    /* Inform subscribers (CalendarComponent)
    that events have changed, so the UI updates. */
    this.eventsChange.next(this.events);
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

  public getCalendars(): Calendar[] {
    return this.calendars;
  }

  public setEvents(events: CalEvent[]) {
    this.events = events;
  }

  public getAllEvents(): CalEvent[] {
    return this.allEvents;
  }

  public setAllEvents(events: CalEvent[]){
    this.allEvents = events;
  }

  public getSubscribedCalendars() {
    return this.subscribedCals;
  }

  public setSubscribedCalendars(cals: SubscribedCalendar[]){
    this.subscribedCals = cals;
  }

  tearDown() {
    this.isInitialized = false;
    this.events = [];
    this.calendars = [];
    this.allEvents = [];
  }
}
