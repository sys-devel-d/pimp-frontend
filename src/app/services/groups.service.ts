import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { Team, Project, Group } from '../models/groups';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export default class GroupsService {

  teams: Team[];
  allTeams: Team[];
  projects: Team[];
  allProjects: Team[];
  teamsChange: Subject<Team[]> = new Subject<Team[]>();
  allTeamsChange: Subject<Team[]> = new Subject<Team[]>();
  otherTeamsChange: Subject<Team[]> = new Subject<Team[]>();
  projectsChange: Subject<Project[]> = new Subject<Team[]>();
  allProjectsChange: Subject<Project[]> = new Subject<Team[]>();
  othersProjectsChange: Subject<Project[]> = new Subject<Team[]>();

  constructor(private http: Http, private authService: AuthService) {}

  init() {
    this.fetchAllGroups();
    this.fetchGroups();
  }

  fetchGroups() {
    const successFunc = ([prjts, tms]) => {
      this.projects = prjts;
      this.teams = tms;
      this.projectsChange.next(prjts);
      this.teamsChange.next(tms);
    }
    this.groupsRequest(this.authService.getCurrentUserName(), successFunc);
  }

  fetchOtherGroups(userName: string) {
    const successFunc = ([prjts, tms]) => {
      this.othersProjectsChange.next(prjts);
      this.otherTeamsChange.next(tms);
    }
    this.groupsRequest(userName, successFunc);
  }

  fetchAllGroups() {
    const successFunc = ([prjts, tms]) => {
      this.allProjects = prjts;
      this.allTeams = tms;
      this.allProjectsChange.next(prjts);
      this.allTeamsChange.next(tms);
    };
    this.allGroupsRequest(successFunc);
  }

  patchGroup(type: string, key: string, body) {
    const headers = { headers: this.authService.getTokenHeader() };
    return this.http
      .patch(Globals.BACKEND + type + '/id/' + key , body, headers)
      .map(res => res.json())
      .subscribe(
        group => this.subscribeToGroup(group, name, type),
        err => console.log(err)
      );
  }

  postNewGroup(type: string, id) {
    const group = {
      name: `New ${type}-${id}`,
      userNames: []
    };
    const headers = { headers: this.authService.getTokenHeader() };
    return this.http
      .post(Globals.BACKEND + type , group, headers)
      .map(res => res.json)
      .subscribe(
        grp => this.addGroup(grp, type),
        err => console.log(err)
      );
  }

  removeGroup(type: string, group: Group) {
    const headers = { headers: this.authService.getTokenHeader() };
    return this.http
      .delete(Globals.BACKEND + type + '/id/' + group.key, headers)
      .subscribe(
        () => this.deleteGroup(group, type),
        err => console.log(err)
      );
  }

  private allGroupsRequest(successFunc) {
    const headers = { headers: this.authService.getTokenHeader() };
    const projectReq = this.http.get(Globals.BACKEND + 'project', headers)
      .map(res => res.json());
    const teamsReq   = this.http.get(Globals.BACKEND + 'team' , headers)
      .map(res => res.json());

    Observable.forkJoin([projectReq, teamsReq]).subscribe(
      successFunc,
      err => console.log(err)
    );
  }

  private groupsRequest(userName: string, successFunc) {
    const headers = { headers: this.authService.getTokenHeader() };
    const projectReq = this.http.get(Globals.BACKEND + 'project/user/' + userName, headers).map( res => res.json() );
    const teamsReq   = this.http.get(Globals.BACKEND + 'team/user/' + userName,    headers).map( res => res.json() );

    Observable.forkJoin([projectReq, teamsReq]).subscribe(
      successFunc,
      err => console.log(err)
    );
  }

  private subscribeToGroup(group, name, type) {
    if (type === 'team') {
      const teams = this.allTeams
        .map(team => {
          if (team.name === name) {
            return group;
          }
          return team;
        });
      this.allTeams = teams;
      this.allTeamsChange.next(teams);
    } else {
      const projects = this.allProjects
        .map(project => {
          if (project.name === name) {
            return group;
          }
          return project;
        });
      this.allProjects = projects;
      this.allProjectsChange.next(projects);
    }
  }

  private addGroup(group, type) {
    if (type === 'team') {
      this.allTeams.push(group);
      this.allTeamsChange.next(this.allTeams);
    } else {
      this.allProjects.push(group);
      this.allProjectsChange.next(this.allProjects);
    }
  }

  private deleteGroup(group, type) {
    if (type === 'team') {
      const teamToRemoveIndex = this.allTeams.indexOf(name);
      this.allTeams.splice(teamToRemoveIndex, 1);
      this.allTeamsChange.next(this.allTeams);
    } else {
      const projectToRemoveIndex = this.allProjects.indexOf(name);
      this.allProjects.splice(projectToRemoveIndex, 1);
      this.allProjectsChange.next(this.allProjects);
    }
  }

  tearDown() {
    this.teams = [];
    this.projects = [];
    this.allTeams = [];
    this.allProjects = [];
  }

  getTeams(): Team[] {
    return this.teams;
  }

  getProjects(): Project[] {
    return this.projects;
  }
  getAllTeams(): Team[] {
    return this.allTeams;
  }

  getAllProjects(): Project[] {
    return this.allProjects;
  }
}
