import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { AuthService } from './auth.service';
import { CalEvent, Calendar } from '../models/base';
import { Subject } from 'rxjs';

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
  private calendars: Calendar[];
  eventsChange: Subject<CalEvent[]> = new Subject<CalEvent[]>();

  constructor(private authService: AuthService, private http: Http) { }

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
    const mappedEvents = calendar.events.map(evt => {
      evt.start = new Date(evt.start);
      evt.end = new Date(evt.end);
      evt.color = calendar.isPrivate ? colors.red : colors.blue;
      return evt;
    });
    calendar.events = mappedEvents;
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
      /* Inform subscribers (CalendarComponent)
      that events have changed, so the UI updates. */
      this.eventsChange.next(this.events);
    })
  }

  getEvents(): CalEvent[] {
    return this.events;
  }

  getViewDate(): Date {
    return this.viewDate;
  }

  getView(): string {
    return this.view;
  }

  getActiveDayIsOpen(): boolean {
    return this.activeDayIsOpen;
  }
}