import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from "../models/base";
import { UserService } from "../services/user.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;
  subscription: Subscription;

  constructor(private userService: UserService) {
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
