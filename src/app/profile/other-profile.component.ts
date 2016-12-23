import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from "../models/base";
import { UserService } from "../services/user.service";
import GroupsService from '../services/groups.service';
import { Subscription } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class OtherProfileComponent extends ProfileComponent implements OnInit, OnDestroy {
  routeSubscription: Subscription;

  constructor(userService: UserService, groupsService: GroupsService, private route: ActivatedRoute) {
    super(userService, groupsService);
    this.isPrivate = false;
  }

  subscribeToUserChange() {
    this.subscription = this.userService.otherUserChange.subscribe( (user:User) => {
      this.user = user;
    });
  }

  subscribeToGroupsChange() {
    const grpSubscr = this.groupsService.otherTeamsChange
      .subscribe( teams => this.teams = teams);
    const prjSubscr = this.groupsService.othersProjectsChange
      .subscribe( projects => this.projects = projects);
    this.groupsSubscriptions = [grpSubscr, prjSubscr];
  }

  ngOnInit() {
    // Every time the route param changes, let the userService make the request
    this.routeSubscription = this.route.params.subscribe( params => {
      const userName = params['userName'];
      this.userService.fetchOtherUser(userName);
      this.groupsService.fetchOtherGroups(userName);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.routeSubscription.unsubscribe();
  }
}
