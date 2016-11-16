import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable } from "rxjs";
import 'rxjs/add/operator/map';

import { Globals } from '../commons/globals';

@Injectable()
export class AuthService {
  public token: string;

  constructor(private http: Http) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  login(username, password): Observable<boolean> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Basic ' + btoa('angularClient:secret123'));
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', 'password');
    urlSearchParams.append('username', username);
    urlSearchParams.append('password', password);
    return this.http
      .post(Globals.API + 'oauth/token', urlSearchParams.toString(), {headers: headers})
      .map((res: Response) => {
        let token = res.json() && res.json().access_token;
        if (token) {
          this.token = token;
          localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));
          return true;
        }
        return false;
      })
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): Boolean {
    return this.token != null;
  }

  getToken(): string {
    return this.token;
  }

}

