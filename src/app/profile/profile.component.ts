import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from "../models/base";
import { UserService } from "../services/user.service";
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;
  userService: UserService;
  subscription: Subscription;
  isPrivate = true;

  constructor(userService: UserService) {
    this.userService = userService;
    this.subscribe();
  }

  subscribe() {
    this.subscription = this.userService.userChange.subscribe( (user:User) => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
