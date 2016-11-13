import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
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
  user: User = new User();
  error: String;
  constructor(authService: AuthService, router: Router) {
    this.authService = authService;
    this.router = router;
  }

  ngOnInit() {
  }

  login() {
    this.authService.login(this.user.username, this.user.password)
      .subscribe(result => {
        if (result === true) {
          this.router.navigate(['profile']);
        } else {
          this.error = 'Username or password is incorrect';
        }
      });
  }
}
