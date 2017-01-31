import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { AuthService } from './auth.service';
import NotificationService from './notification.service';
import { CalEvent, Calendar, SubscribedCalendar, InvitationResponse, Notification } from '../models/base';
import { Observable, Subject } from 'rxjs';
import {DateFormatter} from "@angular/common/src/facade/intl";
import {
  CalendarEventAction
} from 'angular-calendar';
import { IPimpService } from './pimp.services';

declare var tinycolor: any;

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

  readOnlyActions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-info"></i>',
      onClick: ({event}: { event: CalEvent }): void => {
        this.eventClicked(event);
      }
    }
  ];

  constructor(
    private authService: AuthService,
    private http: Http,
    private notificationService: NotificationService) {}

  init() {
    if (!this.isInitialized) {
      this.notificationService.fetchSingleEvent = this.fetchSingleEvent.bind(this);
      this.notificationService.removeEvent = this.removeEvent.bind(this);
      this.fetchUsersCalendars();
    }
  }

  /*
  Function maps a calendar's events coming from server
  so they are in the right format
  */
  private mapCalendarEvents(calendar: Calendar): Calendar {
    calendar.events = calendar.events.map(evt => this.mapEventForFrontend(evt, calendar));
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
          owner: cal.owner,
          title: cal.title,
          active: true,
          hexColor: cal.hexColor,
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

  fetchSingleEvent(calendarKey: string, eventKey: string) {
    this.http.get(
      Globals.BACKEND + `calendar/${calendarKey}/event/${eventKey}`,
      { headers: this.authService.getTokenHeader() }
    ).map( res => res.json() )
    .subscribe( (event: CalEvent) => {
      if(this.allEvents.find(evt => evt.key === event.key)) {
        this.updateEvent(event);
      }
      else {
        this.addEvent(event);
      }
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

  createEvent(event: CalEvent, shouldAnnounce = true): any {
    if(!event.creator) {
      event.creator = this.authService.getCurrentUserName();
    }
    return this.http.post(
      Globals.BACKEND + 'calendar/' + event.calendarKey,
      this.mapEventForBackend(event),
      { headers: this.authService.getTokenHeader() }
    )
    .map(response =>
      response.json()
    )
    .subscribe( (evt: CalEvent) => {
      this.addEvent(evt);
      if(shouldAnnounce) {
        this.notificationService.announceInvitation(evt);
      }
    });
  }

  editEvent(event: CalEvent, newlyInvitedUsers: string[]) {
    this.http.put(
      Globals.BACKEND + 'calendar/event/' + event.key,
      this.mapEventForBackend(event),
      {
        headers: this.authService.getTokenHeader()
      }
    ).subscribe(
      () => {
        this.updateEvent(event);
        const copyEvent = Object.assign({}, event);
        copyEvent.invited = newlyInvitedUsers;
        this.notificationService.announceInvitation(copyEvent);
      },
      err => console.log(err)
    )
  }

  deleteEvent(event: any, shouldAnnounce = true) {
    this.http.delete(
      Globals.BACKEND + 'calendar/event/' + event.key,
      {
        headers: this.authService.getTokenHeader(),
        body: this.mapEventForBackend(event)
      }
    ).subscribe(
      () => {
        this.removeEvent(event);
        if(shouldAnnounce) {
          this.notificationService.announceEventDeletion(event);
        }
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

  acceptOrDeclineInvitation(accept: boolean, notification: Notification, answer?: string) {
    let invitationResponse = this.mapNotificationToInvitationResponse(accept, notification, answer);
    return this.http.post(
      Globals.BACKEND + 'calendar/invitation',
      invitationResponse,
      { headers: this.authService.getTokenHeader() }
    ).subscribe( () => {
      let invitationResponseNotification = this.mapInvitationResponseToNotification(invitationResponse);
      this.notificationService.acknowledgeNotification(notification);
      const eventToBeUpdated = this.allEvents.find( evt => evt.key === notification.referenceKey );
      if(eventToBeUpdated) {
        eventToBeUpdated.invited = eventToBeUpdated.invited.filter ( u => u !== this.authService.getCurrentUserName() );
        if(accept) {
          invitationResponseNotification.intent = 'success';
          eventToBeUpdated.participants.push(this.authService.getCurrentUserName());
        }
        else {
          invitationResponseNotification.intent = 'error'; // ;)
          eventToBeUpdated.declined.push(this.authService.getCurrentUserName());
        }
        
        this.notificationService.announce(invitationResponseNotification);
        this.updateEvent(eventToBeUpdated);
      }
    });
  }

  private mapNotificationToInvitationResponse(accept: boolean, notification: Notification, answer?: string): InvitationResponse {
    let r = new InvitationResponse();
    r.state = accept ? InvitationResponse.ACCEPTED : InvitationResponse.DECLINED;
    r.answer = answer || '';
    r.eventKey = notification.referenceKey;
    r.calendarKey = notification.referenceParentKey;
    r.userName = notification.receivingUser;
    r.invitee = notification.sendingUser;
    return r;
  }

  private mapInvitationResponseToNotification(invitationResponse: InvitationResponse): Notification {
    let n = new Notification();
    n.type = 'EVENT_UPDATE';
    n.acknowledged = false;
    n.message = InvitationResponse.ACCEPTED === invitationResponse.state 
      ? invitationResponse.userName + ' wird teilnehmen.' 
      : invitationResponse.userName + ' wird nicht teilnehmen. Grund: ' 
        + '"' + invitationResponse.answer + '"';
    n.referenceKey = invitationResponse.eventKey;
    n.referenceParentKey = invitationResponse.calendarKey;
    n.receivingUser = invitationResponse.invitee;
    n.sendingUser = invitationResponse.userName;
    return n;
  } 

  private addCalendar(calendar: Calendar) {
    calendar = this.mapCalendarEvents(calendar);
    this.events = this.events.concat(calendar.events);
    this.calendars.push(calendar);
    this.subscribedCals.push({
      key: calendar.key,
      title: calendar.title,
      owner: calendar.owner,
      active: true,
      hexColor: calendar.hexColor,
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

  private removeEvent(event: any, viaNotification = false) {
    let calendarKey = event.calendarKey;
    if(viaNotification) {
      // The event deletion was announced via notification
      calendarKey = this.allEvents.find(evt => evt.key === event.key).calendarKey;
      if(calendarKey !== event.calendarKey) {
        // This event was copied from another event
        const copiedEvent = new CalEvent();
        copiedEvent.key = event.key;
        copiedEvent.calendarKey = calendarKey;
        // OK now we can delete this event from the server. 
        // But don't announce the deletion again because this is a copied event.
        this.deleteEvent(copiedEvent, false);
        return;
      }
    }
    this.events = this.events.filter(evt => evt.key !== event.key);
    this.allEvents = this.allEvents.filter(evt => evt.key !== event.key);
    const correspondingCal = this.calendars.find(cal => cal.key === event.calendarKey);
    correspondingCal.events = correspondingCal.events.filter(evt => evt.key !== event.key);
    this.eventsChange.next(this.events);
  }

  private addEvent(evt: CalEvent) {
    let calendar: Calendar = this.calendars
      .find(cal => cal.key === evt.calendarKey);
    if(!calendar) {
      /* So here is the case where we are probably invited to
         an event which is part of a calendar that we are not subscribed to.
         So now we just copy this event into our calendar (one of our calendars). */
      calendar = this.calendars.find(cal => cal.owner === this.authService.getCurrentUserName());
      if(!calendar) {
        throw new Error("There is no calendar owned by the user. The event cannot be added.");
      }
      else {
        evt.calendarKey = calendar.key;
        this.createEvent(evt, false);
        return;
      }
    }
    evt = this.mapEventForFrontend(evt, calendar);
    calendar.events.push(evt);
    this.events.push(evt);
    this.allEvents.push(evt);
    this.eventsChange.next(this.events);
  }

  private updateEvent(updatedEvent: CalEvent) {
    const calendar = this.calendars.find(cal => cal.key === updatedEvent.calendarKey);
    updatedEvent = this.mapEventForFrontend(updatedEvent, calendar);
    const f = (evt) => evt.key === updatedEvent.key;
    let idx = this.events.findIndex(f);
    this.events[idx] = updatedEvent;
    idx = this.allEvents.findIndex(f);
    this.allEvents[idx] = updatedEvent;
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
    delete evt.cssClass;
    evt.start = DateFormatter.format(event.start, 'de', 'yyyy-MM-dd HH:mm');
    evt.end = DateFormatter.format(event.end, 'de', 'yyyy-MM-dd HH:mm');
    return evt;
  }

  private mapEventForFrontend(evt: any, cal: Calendar): CalEvent {

    const currentUserName = this.authService.getCurrentUserName();
    const isEditable = evt.creator === currentUserName;

    evt.start = new Date(evt.start);
    evt.end = new Date(evt.end);
    const color = cal.hexColor ? cal.hexColor : Calendar.FALLBACK_COLOR;
    evt.color = {
      primary: color,
      secondary: tinycolor(color).lighten(30)
    };
    evt.draggable = isEditable;
    evt.resizable = {
      beforeStart: isEditable,
      afterEnd: isEditable
    }

    // Now it's getting dirty

    let cssClass = 'public';

    if(evt.isPrivate) {
      cssClass = 'private';
    }

    if (isEditable) {
      evt.actions = this.actions;
    }
    else {
      if(evt.isPrivate) {
        const start = DateFormatter.format(evt.start, 'de', 'HH:mm');
        const end = DateFormatter.format(evt.end, 'de', 'HH:mm');
        evt.title = `PRIVATER TERMIN (${evt.creator}, ${start} - ${end})`;
      }
      else {
        evt.actions = this.readOnlyActions;
        if(evt.participants.findIndex(part => part === currentUserName) === -1) {
          // not our event, but public, we are not attending
          cssClass = 'not-attending';
        }
      }
    }

    evt.cssClass = 'pimp-event ' + cssClass;
    
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
