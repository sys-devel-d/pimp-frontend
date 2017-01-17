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
              private groupsService: GroupsService) {
    this.user.email = '';
    this.user.userName = '';
  }

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
                this.error = 'Wir konnten Sie registrieren, aber nicht einloggen. Bitte versuchen Sie es erneut.';
              }
            },
            error => this.error = error
          );
        },
        err => {
          this.error = 'Wir konnten Sie nicht registrieren. ';
          switch (err.status)
          {
            case 409:
              this.error += 'Die E-Mail-Adresse ist bereits vergeben.';
              break;
          }
        }
      )
  }

  private isEmailValid(email: string): boolean {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
  }

  private containsSpecialCharacter(s: string): boolean {
    return ! /^[a-zA-Z0-9- ]*$/.test(s);
  }
}
