import { Component, OnInit, ViewChild } from '@angular/core';
import { Notification, NotificationType, Notifications } from '../models/base';
import NotificationService from '../services/notification.service';
import CalendarService from '../services/calendar.service';
import ReadOnlyEventModalComponent from '../calendar/modal/event/readonly/readonly-event-modal.component';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export default class DashboardComponent implements OnInit {

  @ViewChild(ReadOnlyEventModalComponent) createModalComponent: ReadOnlyEventModalComponent;

  notifications: Notifications;
  availableKeys: NotificationType[];

  constructor(private notificationService: NotificationService,
  private calendarService: CalendarService) {
    this.notificationService.notificationsChange.subscribe( (notifications: Notifications) => {
      this.setupNotifications(notifications);
    });
  }

  ngOnInit() {
    this.setupNotifications(this.notificationService.getNotifications());
  }

  private setupNotifications(notifications: Notifications) {
    this.notifications = notifications;
    this.availableKeys = Object.getOwnPropertyNames(notifications)
        .reduce( (carry: NotificationType[], key: NotificationType) => {
          if(notifications[key].length > 0) {
            carry.push(key);
          }
          return carry;
        }, []);
  }

  handleInvitation(accept: boolean, notification: Notification) {
    let answer = 'Grundlos';
    if (!accept) {
      answer = prompt('Nennen Sie bitte den Grund der Absage!');
    }
    notification.acknowledged = true;
    this.calendarService.acceptOrDeclineInvitation(accept, notification, answer);
  }

  acknowledgeNotification(notification: Notification) {
    notification.acknowledged = true;
    this.notificationService.acknowledgeNotification(notification);
  }

  private getTitle(key: NotificationType): string {
    if(key === 'EVENT_UPDATE' || key === 'EVENT_DELETION') {
      return 'Terminaktualisierungen';
    }
    else if(key === 'NEW_CHAT') {
      return 'Chats';
    }
    else if(key === 'EVENT_INVITATION') {
      return 'Einladungen';
    }
    else {
      throw new Error(`You must define a title for key '${key}'`);
    }
  }

}