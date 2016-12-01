import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { User } from '../models/base';
import { Globals } from "../commons/globals";
import { AuthService } from './auth.service';

@Injectable()
export class UserService {
  constructor(private http: Http, private authService: AuthService) {}

  getProfileInformation(): Observable<User> {
    return this.http
      .get(
        Globals.BACKEND + 'users/' + this.authService.getCurrentUserName(),
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => res.json() as User)
      .catch((error:any) => Observable
        .throw(error.json().error || 'Server error while fetching user.'));
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
}
