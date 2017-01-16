import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Notification, CalEvent, Room, Notifications } from '../models/base';
import { Subject } from 'rxjs';
import { IPimpService } from './pimp.services';
import WebsocketService from './websocket.service';
import { AuthService } from './auth.service';
import { Globals } from '../commons/globals';
import { NotificationsService as NSLibService } from 'angular2-notifications';

@Injectable()
export default class NotificationService implements IPimpService {

  stompClient: any;
  private stompSubscription: any;
  connected:boolean = false;
  private notifications: Notifications = {};
  notificationsChange: Subject<Notifications> = new Subject<Notifications>();
  // See calendarService where these functions are set
  fetchSingleEvent: Function;
  fetchSingleRoom: Function;
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
    .subscribe( (nots:Notification[]) => {
      nots.forEach(not => {
        this.addNotification(not);
      });
      this.notificationsChange.next(this.notifications);
    });
  }

  private getMapKey(not: Notification): string {
    return (not.type === 'EVENT_UPDATE' || not.type === 'EVENT_DELETION') ? 'EVENT_UPDATE' : not.type;
  }

  private addNotification(not: Notification): void {
    const key = this.getMapKey(not);
    if(this.notifications[key]) {
      this.notifications[key].unshift(not);
    }
    else {
      this.notifications[key] = [not];
    }
  }

  connectAndSubscribe() {
    this.stompSubscription = this.stompClient.subscribe('/notifications/' + this.authService.getCurrentUserName(), ({ body }) => {
      const not = JSON.parse(body) as Notification;
      this.addNotification(not);
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
        this.fetchSingleRoom(notification.referenceKey);
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
        break;
      case 'EVENT_DELETION':
        title = 'Termin gelöscht';
        message = n.sendingUser + 'hat den Termin ' + n.message + ' gelöscht';
        break;
      default:
        throw new Error(`Define a title and message for type ${n.type}`);
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
    const usersToBeInformed = (event.participants || [])
      .concat(event.invited || [])
      .concat(event.declined || [])
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
      this.notifications[notification.type] 
        = this.notifications[notification.type].filter(not => not.key !== notification.key);
      this.notificationsChange.next(this.notifications);
    });
  }

  getNotifications(): Notifications {
    return this.notifications;
  }

  tearDown() {
    this.notifications = {};
    this.notificationsChange.next({});
    this.stompSubscription.unsubscribe();
  }
}