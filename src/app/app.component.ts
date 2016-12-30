import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { MessageService } from "./services/message.service";
import { UserService } from './services/user.service';
import CalendarService from './services/calendar.service';
import GroupsService from './services/groups.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'PIMP';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private calendarService: CalendarService,
    private groupsService: GroupsService) {}

  ngOnInit() {
    if(this.authService.isLoggedIn()) {
      this.messageService.init();
      this.userService.init();
      this.calendarService.init();
      this.groupsService.init();
    }
  }

  logout() {
    this.authService.logout();
    this.messageService.tearDown();
    this.userService.tearDown();
    this.calendarService.tearDown();
    this.groupsService.tearDown();
  }
}
