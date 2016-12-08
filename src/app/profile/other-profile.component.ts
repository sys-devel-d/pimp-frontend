import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from "../models/base";
import { UserService } from "../services/user.service";
import { Subscription } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class OtherProfileComponent extends ProfileComponent implements OnInit, OnDestroy {
  routeSubscription: Subscription;

  constructor(userService: UserService, private route: ActivatedRoute) {
    super(userService);
    this.isPrivate = false;
  }

  subscribeToUserChange() {
    this.subscription = this.userService.otherUserChange.subscribe( (user:User) => {
      this.user = user;
    });
  }

  ngOnInit() {
    // Every time the route param changes, let the userService make the request
    this.routeSubscription = this.route.params.subscribe( params => {
       this.userService.fetchOtherUser(params['userName']);
    });
  }

  ngOnDestroy() {
    for(let sub of [this.subscription, this.errorSubscription, this.routeSubscription]) {
      sub.unsubscribe();
    }
  }
}
