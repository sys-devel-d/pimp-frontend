import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { MessageService } from "./services/message.service";
import { UserService } from './services/user.service';
import CalendarService from './services/calendar.service';
import GroupsService from './services/groups.service';
import NotificationService from './services/notification.service';
import WebsocketService from './services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  unreadNotificationsCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private calendarService: CalendarService,
    private groupsService: GroupsService,
    private notificationService: NotificationService,
    private websocketService: WebsocketService) {
      this.notificationService.notificationsChange.subscribe(notifications => {
        this.unreadNotificationsCount = notifications.filter(not => !not.read).length
      });
    }

  ngOnInit() {
    if(this.authService.isLoggedIn()) {
      this.websocketService.init();
      this.userService.init();
      this.calendarService.init();
      this.groupsService.init();
      this.messageService.init();
      this.notificationService.init();
    }
  }

  logout() {
    this.authService.logout();
    this.messageService.tearDown();
    this.userService.tearDown();
    this.calendarService.tearDown();
    this.groupsService.tearDown();
    this.notificationService.tearDown();
    this.websocketService.tearDown();
  }
}
