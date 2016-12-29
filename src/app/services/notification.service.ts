import { Injectable } from '@angular/core';
import { Notification } from '../models/base';
import { Subject } from 'rxjs';
import { IPimpService } from './pimp.services';
import WebsocketService from './websocket.service';
import { AuthService } from './auth.service';

@Injectable()
export default class NotificationService implements IPimpService {

  connected = false;
  stompClient: any;
  private notifications: Notification[];
  notificationsChange: Subject<Notification[]> = new Subject<Notification[]>();

  constructor(private websocketService: WebsocketService, private authService: AuthService) {}

  init() {
    this.stompClient = this.websocketService.getStompClient();

    this.connectAndSubscribe();

    const nots: Notification[] = [
      { message: "Termineinladung", read: false },
      { message: "Termin wurde gelöscht", read: true },
      { message: "Termineinladung", read: false },
      { message: "Zaphod hat schon was besseres vor", read: false },
    ];

    setTimeout(() => {
      this.notifications = nots;
      this.notificationsChange.next(nots);
    }, 2000);
  }

  connectAndSubscribe() {
    const subscribe = () => {
      this.stompClient.subscribe('/notifications/' + this.authService.getCurrentUserName(), ({ body }) => {
        console.log("affenkooooot")
        console.log(body);
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
      notificationMessage: 'Hey du da new message'
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