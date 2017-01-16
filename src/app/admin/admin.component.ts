import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {Team, Project, Group} from '../models/groups';
import {User} from '../models/base';
import {AuthService} from '../services/auth.service';
import GroupsService from '../services/groups.service';
import {UserService} from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  private teams: Team[];
  private projects: Project[];
  private groupsSubscriptions: Subscription[];
  private groupToEdit: Group;
  private typeToEdit: string;

  private userAddingMode: boolean = false;
  private term: string;
  private users: User[];
  private addUserCallback: Function;

  constructor(
    private groupsService: GroupsService,
    private userService: UserService,
    private authService: AuthService) {
    let teamsSub = this.groupsService
      .allTeamsChange.subscribe(teams => this.teams = teams);
    let projectsSub = this.groupsService
      .allProjectsChange.subscribe(projects => this.projects = projects);
    this.groupsSubscriptions = [teamsSub, projectsSub];
    this.addUserCallback = this.addUserToGroup.bind(this);
  }

  ngOnInit() {
    this.teams = this.groupsService.getAllTeams();
    this.projects = this.groupsService.getAllProjects();
  }

  ngOnDestroy() {
    this.groupsSubscriptions.forEach(sub => sub.unsubscribe());
  }

  editName(name, group, type) {
    group.name = name;
    this.groupsService.patchGroup(type, group.key, group);
  }

  addGroup(type: string) {
    // since we have no proper error logging
    // we have to make sure that every name is unique
    // TODO: proper error logging
    const id = this.newGuid();
    this.groupsService.postNewGroup(type, id);
  }

  private newGuid() {
    return 'xxxx-yxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random()*8|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(8);
    });
  }

  editGroup(groupToEdit, type) {
    this.userAddingMode = true;
    this.groupToEdit = groupToEdit;
    this.typeToEdit = type;
  }

  addUserToGroup(user) {
    this.groupToEdit.userNames.push(user.userName);
    this.groupsService
      .patchGroup(this.typeToEdit, this.groupToEdit.key, this.groupToEdit);
    this.userAddingMode = false;
  }

  private searchForUser(term, userList) {
    if (this.term.length >= 3) {
      this.userService.searchAll(this.term)
        .subscribe(
          (users: User[]) => {
            const withoutMember =
              user => userList.indexOf(user.userName) === -1;
            this.users = users.filter(withoutMember);
          },
          err => console.error(err)
        );
    }
  }

  removeUser(name: string, group: Group, type: string) {
    const userToRemoveIndex = group.userNames.indexOf(name);
    group.userNames.splice(userToRemoveIndex, 1);
    this.groupsService
      .patchGroup(type, group.key, group);
  }

  removeGroup(group, type) {
    this.groupsService.removeGroup(type, group);
  }
}
