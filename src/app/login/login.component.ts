import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import PimpServices from '../services/pimp.services';
import { User } from '../models/base';

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
              private pimpServices: PimpServices) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['profile']);
    }
  }

  login() {
    this.authService.login(this.user.userName, this.user.password)
      .subscribe(
        result => {
          if (result === true) {
            this.router.navigate(['profile']);
            this.pimpServices.init();
          } else {
            this.error = 'We are sorry. We could not log you in. Please try again.';
          }
        },
        error => this.error = error
      );
  }
}
