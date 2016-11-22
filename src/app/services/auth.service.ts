import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable } from "rxjs";
import 'rxjs/add/operator/map';

import { Globals } from '../commons/globals';

@Injectable()
export class AuthService {
  private token: string;
  private userName: string;

  constructor(private http: Http) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.userName = currentUser && currentUser.username;
  }

  login(username, password): Observable<boolean> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Basic ' + btoa('angularClient:secret123'));
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', 'password');
    urlSearchParams.append('username', username);
    urlSearchParams.append('password', password);
    return this.http
      .post(Globals.BACKEND + 'oauth/token', urlSearchParams.toString(), {headers: headers})
      .map((res: Response) => {
        let token = res.json() && res.json().access_token;
        if (token) {
          this.token = token;
          this.userName = username;
          localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));
        }
        return token && true;
      })
      .catch( (error:any) => {
        const err = (400 >= error.status && error.status < 500) ?
                    'Username or password is wrong' : 'Server Error'
        return Observable.throw(err)
      });
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

  getCurrentUserName(): string {
    return this.userName;
  }

}

