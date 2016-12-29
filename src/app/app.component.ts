import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import NotificationService from './services/notification.service';
import PimpServices from './services/pimp.services';

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
    private pimpServices: PimpServices,
    notificationService: NotificationService) {
      notificationService.notificationsChange.subscribe(notifications => {
        this.unreadNotificationsCount = notifications.filter(not => !not.read).length
      });
    }

  ngOnInit() {
    if(this.authService.isLoggedIn()) {
      this.pimpServices.init();
    }
  }

  logout() {
    this.authService.logout();
    this.pimpServices.tearDown();
  }
}
