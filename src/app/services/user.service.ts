import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { User } from '../models/user';
import { Globals } from "../commons/globals";
import { AuthService } from './auth.service';

@Injectable()
export class UserService {
  constructor(private http: Http, private authService: AuthService) {}

  getProfileInformation(): Observable<User> {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.authService.getToken() );
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get(Globals.BACKEND + 'users/' + this.authService.getCurrentUserName() , options)
      .map((res: Response) => res.json() as User)
      .catch((error:any) => Observable
        .throw(error.json().error || 'Server error while fetching user.'));
  }

  search(term: string) {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.authService.getToken() );
    let options = new RequestOptions({ headers: headers });

    return this.http
      .get(Globals.BACKEND + 'users/search/' + term, options)
      .map((res: Response) => {
        return res.json()
      })
      .catch((error:any) => Observable
        .throw(error.json().error || 'Server error while searching for users.'));
  }
}
