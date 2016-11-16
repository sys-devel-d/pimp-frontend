import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { User } from "../models/user";
import { Router } from "@angular/router";


@Component({
  selector: 'loginForm',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private router: Router;
  private authService: AuthService;
  private messageService: MessageService;
  user: User = new User();
  error: String;
  constructor(authService: AuthService, router: Router, messageService: MessageService) {
    this.authService = authService;
    this.messageService = messageService;
    this.router = router;
  }

  ngOnInit() {
  }

  login() {
    this.authService.login(this.user.username, this.user.password)
      .subscribe(result => {
        if (result === true) {
          this.router.navigate(['profile']);
          this.messageService.init();
        } else {
          this.error = 'Username or password is incorrect';
        }
      });
  }
}
