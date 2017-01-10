import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Notification, CalEvent, InvitationResponse, Room } from '../models/base';
import { Subject } from 'rxjs';
import { IPimpService } from './pimp.services';
import WebsocketService from './websocket.service';
import { AuthService } from './auth.service';
import { Globals } from '../commons/globals';

@Injectable()
export default class NotificationService implements IPimpService {

  stompClient: any;
  private stompSubscription: any;
  connected:boolean = false;
  private notifications: Notification[];
  notificationsChange: Subject<Notification[]> = new Subject<Notification[]>();
  // See calendarService where this function is set.
  fetchSingleEvent: Function;

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
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
      this.notifications.push(not);
      this.handleNotification(not);
      this.notificationsChange.next(this.notifications);
    });
  }

  handleNotification(notification: Notification): void {
    switch(notification.type) {
      case "EVENT_UPDATE":
      case "EVENT_INVITATION":
        this.fetchSingleEvent(notification.referenceParentKey, notification.referenceKey);
        break;
      case "NEW_CHAT":
        // Fetch chatRoom and add
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
      let notification = new Notification();
      notification.type = 'EVENT_INVITATION';
      notification.acknowledged = false;
      notification.message = event.title;
      notification.referenceParentKey = event.calendarKey;
      notification.referenceKey = event.key;
      notification.sendingUser = 
        this.authService.getCurrentUserName();
      notification.receivingUser = invited;
      this.announce(notification);
    })
  }

  announceNewChat(room: Room, isPrivateChat: boolean = true) {
    const currentUserName = this.authService.getCurrentUserName();
    const receivingUsers = room.participants.filter(user => user.userName !== currentUserName);
    const notification = new Notification();
    notification.acknowledged = false;
    notification.referenceKey = room.roomName;
    notification.message = 'Neuer privater Chat mit ' + currentUserName;
    notification.sendingUser = currentUserName;
    notification.type = 'NEW_CHAT';
    receivingUsers.forEach( user => {
      notification.receivingUser = user.userName;
      this.announce(notification);
    });
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