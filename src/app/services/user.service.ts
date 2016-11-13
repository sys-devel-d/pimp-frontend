import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { AuthService } from './auth.service';
import { User } from '../models/user';
import { Globals } from "../commons/globals";

@Injectable()
export class UserService {
  constructor(
    private http: Http,
    private authService: AuthService) {
  }

  getProfileInformation(): Observable<User> {
    let headers =
      new Headers({ 'AuthToken': 'Bearer ' + this.authService.token });
    let options = new RequestOptions({ headers: headers });
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return this.http
      .get(Globals.BACKEND + 'users/' + currentUser.username , options)
      .map((res: Response) => res.json() as User)
      .catch((error:any) => Observable
        .throw(error.json().error || 'Server error while fetching user.'));
  }
}
