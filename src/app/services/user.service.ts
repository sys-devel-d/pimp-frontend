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
  otherUser: User;
  userChange: Subject<User> = new Subject<User>();
  otherUserChange: Subject<User> = new Subject<User>();
  errorChange: Subject<string> = new Subject<string>();

  constructor(private http: Http, private authService: AuthService) {}

  init() {
    this.fetchUser();
  }

  fetchUser() {
    const successFunc = (user:User) => {
      this.currentUser = user;
      this.userChange.next(user);
    };
    this.userRequest(this.authService.getCurrentUserName(), successFunc);
  }

  fetchOtherUser(userName) {
    const successFunc = (user:User) => {
      this.otherUser = user;
      this.otherUserChange.next(user);
    };
    this.userRequest(userName, successFunc);
  }

  private userRequest(userName: string, successFunc) {
    this.errorChange.next(null);
    return this.http
      .get(
        Globals.BACKEND + 'users/' + userName,
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => res.json() as User)
      .catch((error:any) => {
        let err;
        if(error.status === 404) {
          err = 'This user does not exist.';
        }
        else {
          err = error.json() ? error.json().error : 'Server error while fetching user.';
        }
        return Observable.throw(err);
      })
      .subscribe(
        successFunc,
        error => this.errorChange.next(error)
      );
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
        .throw(error.json() ? error.json().error : 'Server error while searching for users.'));
  }

  getAllUsers() {
    return this.http
      .get(
        Globals.BACKEND + 'users/',
        { headers: this.authService.getTokenHeader() }
      )
      .map( (res: Response) => res.json() as User[])
  }

  editStatus(status) {
    return this.http
      .put(
        Globals.BACKEND + 'users/status/',
        { updatedStatus: status },
        { headers: this.authService.getTokenHeader() }
      )
      .catch( (err) => {
        return Observable.throw(err.json() ? err.json().error : 'Der Status konnte nicht aktualisiert werden.')
      })
  }

  getCurrentUser() {
    return this.currentUser;
  }
}
