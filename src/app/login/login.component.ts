import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import CalendarService from '../services/calendar.service';
import { User } from "../models/base";
import { Router } from "@angular/router";


@Component({
  selector: 'loginForm',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: User = new User();
  error: String;
  constructor(private authService: AuthService,
              private router: Router,
              private messageService: MessageService,
              private calendarService: CalendarService) {}

  ngOnInit() {
    if(this.authService.isLoggedIn()) {
      this.router.navigate(['profile'])
    }
  }

  login() {
    this.authService.login(this.user.userName, this.user.password)
      .subscribe(
        result => {
          if (result === true) {
            this.router.navigate(['profile']);
            this.messageService.init();
            this.calendarService.init();
          } else {
            this.error = 'We are sorry. We could not log you in. Please try again.';
          }
        },
        error => this.error = error
      );
  }
}
