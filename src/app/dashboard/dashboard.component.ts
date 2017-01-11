import { Component, OnInit, ViewChild } from '@angular/core';
import { Notification } from '../models/base';
import NotificationService from '../services/notification.service';
import CalendarService from '../services/calendar.service';
import ReadOnlyEventModalComponent from '../calendar/modal/event/readonly/readonly-event-modal.component';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export default class DashboardComponent implements OnInit {

  @ViewChild(ReadOnlyEventModalComponent) createModalComponent: ReadOnlyEventModalComponent;

  notifications: Notification[];

  constructor(private notificationService: NotificationService, 
  private calendarService: CalendarService) {
    this.notificationService.notificationsChange.subscribe( notifications => {
      this.notifications = notifications;
    });
  }

  ngOnInit() {
    this.notifications = this.notificationService.getNotifications();
  }

  handleInvitation(accept: boolean, notification: Notification) {
    let answer = "Grundlos";
    if (!accept) {
      answer = prompt("Nennen Sie bitte den Grund der Absage!");
    }
    notification.acknowledged = true;
    this.calendarService.acceptOrDeclineInvitation(accept, notification, answer);
  }

  acknowledgeNotification(notification: Notification) {
    notification.acknowledged = true;
    this.notificationService.acknowledgeNotification(notification);
  }

}