import { Component, OnInit } from '@angular/core';
import { Notification } from '../models/base';
import NotificationService from '../services/notification.service';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export default class DashboardComponent implements OnInit {

  notifications: Notification[];

  constructor(private notificationService: NotificationService) {
    this.notificationService.notificationsChange.subscribe( notifications => {
      this.notifications = notifications;
    });
  }

  ngOnInit() {
    this.notifications = this.notificationService.getNotifications();
  }
}