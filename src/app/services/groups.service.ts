import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { Team, Project } from '../models/groups';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export default class GroupsService {

  teams: Team[];
  projects: Team[];
  teamsChange: Subject<Team[]> = new Subject<Team[]>();
  otherTeamsChange: Subject<Team[]> = new Subject<Team[]>();
  projectsChange: Subject<Project[]> = new Subject<Team[]>();
  othersProjectsChange: Subject<Project[]> = new Subject<Team[]>();

  constructor(private http: Http, private authService: AuthService) {}

  init() {
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

  private groupsRequest(userName: string, successFunc) {
    const headers = { headers: this.authService.getTokenHeader() };
    const projectReq = this.http.get(Globals.BACKEND + 'project/user/' + userName, headers).map( res => res.json() );
    const teamsReq   = this.http.get(Globals.BACKEND + 'team/user/' + userName,    headers).map( res => res.json() );

    Observable.forkJoin([projectReq, teamsReq]).subscribe(
      successFunc,
      err => console.log(err)
    );
  }

  tearDown() {
    this.teams = [];
    this.projects = [];
  }

  getTeams(): Team[] {
    return this.teams;
  }

  getProjects(): Project[] {
    return this.projects;
  }
}