import { Injectable } from '@angular/core';
import { Notification } from '../models/base';
import { Subject } from 'rxjs';

@Injectable()
export default class NotificationService {

  notifications: Notification[];
  notificationsChange: Subject<Notification[]> = new Subject<Notification[]>();

  constructor() {}

  init() {
    const nots: Notification[] = [
      { message: "Termineinladung", read: false },
      { message: "Termin wurde gelöscht", read: true },
      { message: "Termineinladung", read: false },
      { message: "Zaphod hat schon was besseres vor", read: false },
    ];
    // setup WebSocket conn
    setTimeout(() => {
      this.notifications = nots;
      this.notificationsChange.next(nots);
    }, 2000);
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  tearDown() {
    this.notifications = [];
    // TODO: Close WebSocket conn
  }
}