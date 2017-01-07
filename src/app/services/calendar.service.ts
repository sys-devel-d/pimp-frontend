import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { AuthService } from './auth.service';
import { CalEvent, Calendar, SubscribedCalendar } from '../models/base';
import { Observable, Subject } from 'rxjs';
import {DateFormatter} from "@angular/common/src/facade/intl";
import {
  CalendarEventAction
} from 'angular-calendar';
import { IPimpService } from './pimp.services';

const colors: any = {
  red: { primary: '#ad2121', secondary: '#FAE3E3' },
  blue: { primary: '#1e90ff', secondary: '#D1E8FF' },
  yellow: { primary: '#e3bc08', secondary: '#FDF1BA' },
  grey: { primary: '#d3d3d3', secondary: '#D4D4D4' }
};

@Injectable()
export default class CalendarService implements IPimpService {

  isInitialized = false;
  private viewDate: Date = new Date();
  private view: string = 'month';
  private activeDayIsOpen: boolean = true;
  private events: CalEvent[] = [];
  private allEvents: CalEvent[] = [];
  private calendars: Calendar[] = [];
  private subscribedCals: SubscribedCalendar[] = [];

  eventsChange: Subject<CalEvent[]> = new Subject<CalEvent[]>();
  initializedChange: Subject<boolean> = new Subject<boolean>();
  calendarsChange: Subject<Calendar[]> = new Subject<Calendar[]>();
  eventClicked: Function;

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
          this.deleteEvent(event);
        }
      }
    }
  ];

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
    calendar.events = calendar.events.map(evt => this.mapEventForFrontend(evt));
    return calendar;
  }

  private fetchUsersCalendars() {
    return this.http.get(
      Globals.BACKEND + 'calendar',
      { headers: this.authService.getTokenHeader() }
    ).map((res: Response) => {
      return res.json() as Calendar[]
    }).finally(() => {
      // emit true or false in any case
      this.initializedChange.next(this.isInitialized);
    })
    .subscribe((calendars: Calendar[]) => {
      // Bring calendars and their events in the correct format
      this.calendars = calendars.map(cal => this.mapCalendarEvents(cal));
      // Produce one array of events by concatenating all of the calendar's events
      this.events = this.calendars
        .map(cal => cal.events)
        .reduce((a, b) => a.concat(b), []);
      this.allEvents = this.events.slice(0);
      this.subscribedCals = this.calendars.map( cal => {
        return {
          key: cal.key,
          title: cal.title,
          active: true,
          unsubscribable: cal.owner !== this.authService.getCurrentUserName()
        }
      });
      this.calendarsChange.next(this.calendars);
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
    ).map( res => res.json() as Calendar )
    .subscribe( (cal: Calendar) => this.addCalendar(cal) );
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
    )
    .map(response => response.json())
    .subscribe( (evt: CalEvent) => this.addEvent(evt) );
  }

  editEvent(event: CalEvent) {
    this.http.put(
      Globals.BACKEND + 'calendar/event/' + event.key,
      this.mapEventForBackend(event),
      {
        headers: this.authService.getTokenHeader()
      }
    ).subscribe(
      () => this.updateEvent(event),
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
      () => this.removeEvent(event),
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
      .map((res: Response) => res.json() as Calendar)
      .subscribe( calendar => this.addCalendar(calendar) );
  }

  unsubscribe(key: string) {
    return this.http
      .patch(
        Globals.BACKEND + 'calendar/unsubscribe/' + key,
        {},
        { headers: this.authService.getTokenHeader() }
      ).subscribe( () => this.removeCalendar(key) );
  }

  private addCalendar(calendar: Calendar) {
    calendar = this.mapCalendarEvents(calendar);
    this.events = this.events.concat(calendar.events);
    this.calendars.push(calendar);
    this.subscribedCals.push({
      key: calendar.key,
      title: calendar.title,
      active: true,
      unsubscribable: calendar.owner !== this.authService.getCurrentUserName()
    });
    this.eventsChange.next(this.events);
    this.calendarsChange.next(this.calendars);
  }

  private removeCalendar(calendarKey: string) {
    this.calendars = this.calendars.filter(cal => cal.key !== calendarKey);
    this.subscribedCals = this.subscribedCals.filter(sc => sc.key !== calendarKey);
    this.events = this.events.filter(evt => evt.calendarKey !== calendarKey);
    this.eventsChange.next(this.events);
    this.calendarsChange.next(this.calendars);
  }

  private removeEvent(event: any) {
    this.events = this.events.filter(evt => evt.key !== event.key);
    this.allEvents= this.allEvents.filter(evt => evt.key !== event.key);
    const correspondingCal = this.calendars.find(cal => cal.key === event.calendarKey);
    correspondingCal.events = correspondingCal.events.filter(evt => evt.key !== event.key);
    this.eventsChange.next(this.events);
  }

  private addEvent(evt: CalEvent) {
    evt = this.mapEventForFrontend(evt);
    let calendar: Calendar = this.calendars
      .find(cal => cal.key === evt.calendarKey);
    calendar.events.push(evt);
    this.events.push(evt);
    this.allEvents.push(evt);
    this.eventsChange.next(this.events);
  }

  private updateEvent(updatedEvent: CalEvent) {
    const f = (evt) => evt.key === updatedEvent.key;
    let idx = this.events.findIndex(f);
    this.events[idx] = updatedEvent;
    idx = this.allEvents.findIndex(f);
    this.allEvents[idx] = updatedEvent;
    const calendar = this.calendars.find(cal => cal.key === updatedEvent.calendarKey);
    idx = calendar.events.findIndex(f);
    calendar.events[idx] = updatedEvent;
    this.eventsChange.next(this.events);
  }

  private mapEventForBackend(event: CalEvent): any {
    const evt: any = Object.assign({}, event);
    delete evt.color;
    delete evt.actions;
    delete evt.draggable;
    delete evt.resizable;
    evt.start = DateFormatter.format(event.start, 'de', 'yyyy-MM-dd HH:mm');
    evt.end = DateFormatter.format(event.end, 'de', 'yyyy-MM-dd HH:mm');
    return evt;
  }

  private mapEventForFrontend(evt: any): CalEvent {
    evt.start = new Date(evt.start);
    evt.end = new Date(evt.end);
    evt.color = evt.isPrivate ? colors.red : colors.blue;
    evt.draggable = true;
    evt.resizable = {
      beforeStart: true,
      afterEnd: true
    }

    if (evt.creator === this.authService.getCurrentUserName()) {
      evt.actions = this.actions;
    }
    else if(evt.isPrivate) {
      const start = DateFormatter.format(evt.start, 'de', 'HH:mm');
      const end = DateFormatter.format(evt.end, 'de', 'HH:mm');
      evt.title = `PRIVATER TERMIN (${evt.creator}, ${start} - ${end})`;
      evt.color = colors.grey;
    }
    
    return evt;
  }

  filterEventsByCalendars(subscribedCalendars: SubscribedCalendar[]) {
    const calKeys = subscribedCalendars.filter(sc => sc.active).map(sc => sc.key);
    const activeCalendars = this.calendars.filter(c => calKeys.indexOf(c.key) !== -1);
    this.events = activeCalendars
        .map(cal => cal.events)
        .reduce((a, b) => a.concat(b), []);
    this.eventsChange.next(this.events);
  }

  public getCalendars(): Calendar[] {
    return this.calendars;
  }

  public getAllEvents(): CalEvent[] {
    return this.allEvents;
  }

  public getSubscribedCalendars() {
    return this.subscribedCals;
  }

  tearDown() {
    this.isInitialized = false;
    this.events = [];
    this.calendars = [];
    this.allEvents = [];
    this.subscribedCals = [];
  }
}
