import { Component, OnInit } from '@angular/core';
import {User} from "../models/base";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {MessageService} from "../services/message.service";
import CalendarService from "../services/calendar.service";
import {UserService} from "../services/user.service";
import GroupsService from "../services/groups.service";
import {Globals} from "../commons/globals";
import {Http, Headers} from "@angular/http";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user: User = new User();
  error: String;

  constructor(private http: Http,
              private authService: AuthService,
              private router: Router,
              private messageService: MessageService,
              private calendarService: CalendarService,
              private userService: UserService,
              private groupsService: GroupsService) {}

  ngOnInit() {
  }

  register() {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa('angularClient:secret123'));
    this.http
      .post(Globals.BACKEND + 'users', this.user, {headers: headers})
      .subscribe(response => {
        this.authService.login(this.user.userName, this.user.password)
          .subscribe(result => {
              if (result === true) {
                this.router.navigate(['profile']);
                this.messageService.init();
                this.calendarService.init();
                this.userService.init();
                this.groupsService.init();
              } else {
                this.error = 'We could register you, but could not log you in. Please try again.';
              }
            },
            error => this.error = error
          );
        },
        err => {
          this.error = 'We could not register you. ';
          switch (err.status)
          {
            case 400:
              this.error += 'The email address must end with "@pim-plus.org".';
              break;
            case 409:
              this.error += 'The email address or username is already taken.';
              break;
            case 422:
              this.error += 'The username should not contain any special characters and the password must be at least 8 characters long.';
              break;
          }
        }
      )
  }
}
