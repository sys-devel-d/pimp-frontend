import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Notification, CalEvent, Room } from '../models/base';
import { Subject } from 'rxjs';
import { IPimpService } from './pimp.services';
import WebsocketService from './websocket.service';
import { AuthService } from './auth.service';
import { Globals } from '../commons/globals';
import { NotificationsService as NSLibService } from 'angular2-notifications';
import { defaultIcons } from 'angular2-notifications/src/icons';

@Injectable()
export default class NotificationService implements IPimpService {

  stompClient: any;
  private stompSubscription: any;
  connected:boolean = false;
  private notifications: Notification[];
  notificationsChange: Subject<Notification[]> = new Subject<Notification[]>();
  // See calendarService where these functions are set
  fetchSingleEvent: Function;
  removeEvent: Function;

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
    private _nsService: NSLibService,
    private http: Http) {}

  init() {
    this.stompClient = this.websocketService.getStompClient();
    this.connectAndSubscribe();
    this.http.get(
      Globals.BACKEND + 'notification/messages/' + this.authService.getCurrentUserName(),
      { headers: this.authService.getTokenHeader() }
    )
    .map( (resp: Response) => resp['_body'] !== '' ? resp.json() : [])
    .subscribe( nots => {
      this.notifications = nots;
      this.notificationsChange.next(nots);
    });
  }

  connectAndSubscribe() {
    this.stompSubscription = this.stompClient.subscribe('/notifications/' + this.authService.getCurrentUserName(), ({ body }) => {
      const not = JSON.parse(body);
      this.notifications.unshift(not);
      this.handleNotification(not);
      this.notificationsChange.next(this.notifications);
    });
  }

  handleNotification(notification: Notification): void {
    this.displayToastNotification(notification);
    switch(notification.type) {
      case "EVENT_UPDATE":
      case "EVENT_INVITATION":
        this.fetchSingleEvent(notification.referenceParentKey, notification.referenceKey);
        break;
      case "NEW_CHAT":
        // TODO
        break;
      case "EVENT_DELETION":
        const event = new CalEvent();
        event.key = notification.referenceKey;
        event.calendarKey = notification.referenceParentKey;
        this.removeEvent(event, true);
        break;
    }
  }

  private displayToastNotification(n: Notification): void {
    if(window.location.pathname.startsWith('/dashboard')) {
      return;
    }

    let title;
    let message;

    switch(n.type) {
      case 'EVENT_UPDATE':
        title = 'Terminaktualisierung';
        message = n.message;
        break;
      case 'EVENT_INVITATION':
        title = 'Einladung';
        message = n.sendingUser + ' läd sie zur Teilnahme an ' + n.message + ' ein';
        break;
      case 'NEW_CHAT':
        title = 'Neuer Chat';
        message = 'Sie sind nun mit ' + n.sendingUser + ' in einem Chat';
    }

    const ns = this._nsService;

    switch(n.intent) {
      case 'success':
        ns.success(title, message);
        break;
      case 'info':
        ns.info(title, message);
        break;
      case 'alert':
        ns.alert(title, message);
        break;
      case 'error':
        ns.error(title, message);
        break;
    }
  }

  announce(notification: Notification) {
    this.stompClient.send(
      '/app/broker/notifications/' + notification.receivingUser,
      {},
      JSON.stringify(notification)
    );
  }

  announceInvitation(event: CalEvent) {
    event.invited.forEach( invited => {
      let n = new Notification();
      n.type = 'EVENT_INVITATION';
      n.acknowledged = false;
      n.message = event.title;
      n.referenceParentKey = event.calendarKey;
      n.referenceKey = event.key;
      n.intent = 'info';
      n.sendingUser = 
        this.authService.getCurrentUserName();
      n.receivingUser = invited;
      this.announce(n);
    })
  }

  announceNewChat(room: Room) {
    const currentUserName = this.authService.getCurrentUserName();
    const receivingUsers = room.participants.filter(user => user.userName !== currentUserName);
    const n = new Notification();
    n.acknowledged = false;
    n.referenceKey = room.roomName;
    n.message = 'Neuer Chat mit ' + currentUserName;
    if(room.roomType == Globals.CHATROOM_TYPE_GROUP) {
      n.message = n.message + ' und anderen';
    }
    n.sendingUser = currentUserName;
    n.intent = 'info';
    n.type = 'NEW_CHAT';
    receivingUsers.forEach( user => {
      n.receivingUser = user.userName;
      this.announce(n);
    });
  }

  announceEventDeletion(event: CalEvent) {
    const n = new Notification();
    n.acknowledged = false;
    n.message = event.title;
    n.intent = 'alert';
    n.sendingUser = this.authService.getCurrentUserName();
    n.type = 'EVENT_DELETION';
    n.referenceKey = event.key;
    n.referenceParentKey = event.calendarKey;
    const usersToBeInformed = (event.participants, [])
      .concat((event.invited, []))
      .concat((event.declined, []))
      .filter( usr => usr !== this.authService.getCurrentUserName());
    usersToBeInformed.forEach( user => {
      n.receivingUser = user;
      this.announce(n);
    })
  }

  acknowledgeNotification(notification: Notification) {
    this.http.post(
      Globals.BACKEND + 'notification/acknowledge',
      notification,
      {
        headers: this.authService.getTokenHeader()
      }
    ).subscribe((res) => {
      this.notifications = this.notifications.filter(not => not.key !== notification.key);
      this.notificationsChange.next(this.notifications);
    });
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  tearDown() {
    this.notifications = [];
    this.notificationsChange.next([]);
    this.stompSubscription.unsubscribe();
  }
}