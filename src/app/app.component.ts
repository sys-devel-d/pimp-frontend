import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { MessageService } from "./services/message.service";
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'PIMP';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService) {}

  ngOnInit() {
    if(this.authService.isLoggedIn()) {
      this.messageService.init();
      this.userService.init();
    }
  }

  logout() {
    this.authService.logout();
    this.messageService.tearDown();
  }
}