import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/map';

import { User } from '../models/base';
import { Globals } from "../commons/globals";
import { AuthService } from './auth.service';

@Injectable()
export class UserService {

  currentUser: User;
  userChange: Subject<User> = new Subject<User>();

  constructor(private http: Http, private authService: AuthService) {}

  getProfileInformation(){
    return this.http
      .get(
        Globals.BACKEND + 'users/' + this.authService.getCurrentUserName(),
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => res.json() as User)
      .catch((error:any) => Observable
        .throw(error.json().error || 'Server error while fetching user.'))
      .subscribe( (user:User) => {
        this.currentUser = user;
        this.userChange.next(user);
      });
  }

  search(term: string) {
    return this.http
      .get(
        Globals.BACKEND + 'users/search/' + term,
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => {
        return res.json()
      })
      .catch((error:any) => Observable
        .throw(error.json().error || 'Server error while searching for users.'));
  }

  getAllUsers() {
    return this.http
      .get(
        Globals.BACKEND + 'users/',
        { headers: this.authService.getTokenHeader() }
      )
      .map( (res: Response) => res.json() as User[])
  }

  getCurrentUser() {
    return this.currentUser;
  }
}
