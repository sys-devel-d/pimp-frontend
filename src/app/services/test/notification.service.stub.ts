import { Injectable } from '@angular/core';
import NotificationService from '../notification.service';

@Injectable()
export default class NotificationServiceStub extends NotificationService {

  init() {

  }

  getNotifications() {
    return {};
  }
}