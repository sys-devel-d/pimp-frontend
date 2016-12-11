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
  errorSubscription: Subscription;
  isPrivate = true;
  error: string;

  constructor(userService: UserService) {
    this.userService = userService;
    this.errorSubscription = userService.errorChange
      .subscribe( err => this.error = err );
    this.subscribeToUserChange();
  }

  subscribeToUserChange() {
    this.subscription = this.userService.userChange
      .subscribe( (user:User) => this.user = user );
  }

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
