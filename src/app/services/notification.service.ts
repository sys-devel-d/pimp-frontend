import { Injectable } from '@angular/core';
import { Notification } from '../models/base';
import { Subject } from 'rxjs';
import { IPimpService } from './pimp.services';

@Injectable()
export default class NotificationService implements IPimpService {

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
    this.notificationsChange.next([]);
    // TODO: Close WebSocket conn
  }
}