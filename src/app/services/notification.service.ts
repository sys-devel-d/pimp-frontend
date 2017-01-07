import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Notification } from '../models/base';
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

  announce() {
    const not = JSON.stringify({
      type: 'NEW_MESSAGE',
      acknowledged: false,
      message: 'TEST NOTIFICATION TO MYSELF',
      roomId: this.authService.getCurrentUserName()
    });
    this.stompClient.send('/app/broker/notifications/' + this.authService.getCurrentUserName(), {}, not);
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  tearDown() {
    this.notifications = [];
    this.notificationsChange.next([]);
  }
}