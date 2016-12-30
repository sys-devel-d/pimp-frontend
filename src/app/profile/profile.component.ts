import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../models/base';
import { Team, Project } from '../models/groups';
import { UserService } from '../services/user.service';
import GroupsService from '../services/groups.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;
  userService: UserService;
  groupsService: GroupsService;
  subscription: Subscription;
  groupsSubscriptions: Subscription[];
  errorSubscription: Subscription;
  isPrivate = true;
  error: string;
  photoFile: File;

  teams: Team[];
  projects: Project[];

  constructor(userService: UserService, groupsService: GroupsService) {
    this.userService = userService;
    this.groupsService = groupsService;
    this.errorSubscription = userService.errorChange
      .subscribe( err => this.error = err );
    this.subscribeToUserChange();
    this.subscribeToGroupsChange();
  }

  private onEditStatus(status) {
    status = status.trim();
    if(status != this.user.status && this.isPrivate) {
      this.userService.editStatus(status)
      .subscribe(
        res => {
          this.user.status = status;
        },
        error => {
          this.error = `Fehler: ${error}`;
        }
      );
    }
  }

  subscribeToUserChange() {
    this.subscription = this.userService.userChange
      .subscribe( (user:User) => this.user = user );
  }

  subscribeToGroupsChange() {
    const grpSubscr = this.groupsService.teamsChange
      .subscribe( teams => this.teams = teams);
    const prjSubscr = this.groupsService.projectsChange
      .subscribe( projects => this.projects = projects);
    this.groupsSubscriptions = [grpSubscr, prjSubscr];
  }

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
    this.teams = this.groupsService.getTeams();
    this.projects = this.groupsService.getProjects();
  }

  uploadPhoto() {
    this.getImageData((e) => {
      let imageData = e.target.result;
      this.userService
        .postUserPhoto(this.user.userName, imageData);
    });
  }

  fileChangeEvent(fileInput: any){
    this.photoFile = fileInput.target.files[0];
  }

  getImageData(onLoadCallback) {
    let fr = new FileReader();
    fr.onload = onLoadCallback;
    fr.readAsDataURL(this.photoFile);
  }

  ngOnDestroy() {
    const subs = [this.subscription, this.errorSubscription, ...this.groupsSubscriptions];
    subs.forEach(sub => sub.unsubscribe());
  }
}
