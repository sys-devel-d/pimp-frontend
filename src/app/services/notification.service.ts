import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Notification, CalEvent, InvitationResponse } from '../models/base';
import { Subject } from 'rxjs';
import { IPimpService } from './pimp.services';
import WebsocketService from './websocket.service';
import { AuthService } from './auth.service';
import { Globals } from '../commons/globals';

@Injectable()
export default class NotificationService implements IPimpService {

  stompClient: any;
  private notifications: Notification[];
  notificationsChange: Subject<Notification[]> = new Subject<Notification[]>();

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
    const subscribe = () => {
      this.stompClient.subscribe('/notifications/' + this.authService.getCurrentUserName(), ({ body }) => {
        const not = JSON.parse(body);
        this.notifications.push(not);
      })
    }

    if(this.websocketService.connected) {
      subscribe();
    }
    else {
      this.websocketService.connectedChange.take(1).subscribe( frame => {
        subscribe();
      })
    }
  }

  announce(notification: Notification) {
    this.stompClient.send('/app/broker/notifications/' + notification.receivingUser,
      {}, JSON.stringify(notification));
  }

  announceInvitation(event: CalEvent) {
    event.participants.forEach(participant => {
      let notification = new Notification();
      notification.type = 'EVENT_INVITATION';
      notification.acknowledged = false;
      notification.message = event.title;
      notification.calendarKey = event.calendarKey;
      notification.eventKey = event.key;
      notification.sendingUser = 
        this.authService.getCurrentUserName();
      notification.receivingUser = participant;
      this.announce(notification);
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
  }
}