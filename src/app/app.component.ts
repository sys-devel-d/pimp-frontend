import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { MessageService } from "./services/message.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService, AuthService]
})
export class AppComponent {
  title = 'PIMP';
  router: Router;
  authService: AuthService;
  messageService: MessageService;

  constructor(router: Router, authService: AuthService, messageService: MessageService) {
    this.router = router;
    this.authService = authService;
    this.messageService = messageService;
  }

  logout() {
    this.authService.logout();
    this.messageService.tearDown();
  }
}