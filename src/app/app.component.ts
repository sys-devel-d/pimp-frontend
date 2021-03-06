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
  options = {
    position: ["bottom", "right"],
    timeOut: 5000,
    lastOnBottom: true
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private pimpServices: PimpServices,
    notificationService: NotificationService) {
      notificationService.notificationsChange.subscribe(notifications => {
        this.unreadNotificationsCount = Object.getOwnPropertyNames(notifications).reduce( (carry: number, key: string) => {
          return carry + notifications[key].length;
        }, 0);
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
