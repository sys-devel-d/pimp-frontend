import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {Team, Project} from '../models/groups';
import GroupsService from '../services/groups.service';
import AdminModalComponent from './modal/admin-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  @ViewChild(AdminModalComponent) adminModalComponent: AdminModalComponent;

  private teams: Team[];
  private projects: Project[];
  private groupsSubscriptions: Subscription[];

  constructor(private groupsService: GroupsService) {
    let teamsSub = this.groupsService
      .allTeamsChange.subscribe(teams => this.teams = teams);
    let projectsSub = this.groupsService
      .allProjectsChange.subscribe(projects => this.projects = projects);
    this.groupsSubscriptions = [teamsSub, projectsSub];
  }

  ngOnInit() {
    this.teams = this.groupsService.getAllTeams();
    this.projects = this.groupsService.getAllProjects();
  }

  ngOnDestroy() {
    this.groupsSubscriptions.forEach(sub => sub.unsubscribe());
  }

  editName(name) {
    console.log(name);
  }

  addGroup() {
    console.log('add');
  }

  editGroup(name) {
    console.log('edit');
  }
}
