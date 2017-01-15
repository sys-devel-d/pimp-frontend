import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { Globals } from '../commons/globals';

@Injectable()
export class AuthService {
  private token: string;
  private userName: string;
  private roles: string[];

  constructor(private http: Http) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.userName = currentUser && currentUser.userName;
  }

  login(userName, password): Observable<boolean> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Basic ' + btoa('angularClient:secret123'));
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', 'password');
    urlSearchParams.append('username', userName);
    urlSearchParams.append('password', password);
    return this.http
      .post(Globals.BACKEND + 'oauth/token', urlSearchParams.toString(), {headers: headers})
      .map((res: Response) => {
        let token = res.json() && res.json().access_token;
        let expiresIn = res.json() && res.json().expires_in;
        let roles = res.json() && res.json().user_roles;
        if (token) {
          this.token = token;
          this.userName = userName;
          this.roles = roles;
          localStorage.setItem('currentUser', JSON.stringify({
            userName: userName,
            token: token,
            expiresIn: expiresIn,
            startDate: new Date(),
            roles: roles
          }));
        }
        return token && true;
      })
      .catch( (error:any) => {
        const err = (400 <= error.status && error.status < 500) ?
                    'Username or password is wrong' : 'Server Error'
        return Observable.throw(err)
      });
  }

  getTokenHeader(): Headers {
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.getToken());
    return headers;
  }

  logout(): void {
    this.token = null;
    this.roles = null;
    this.userName = null;
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

  getRoles(): string[] {
    return this.roles;
  }

  isAdmin(): boolean {
    if (this.roles.indexOf('ROLE_ADMIN') !== -1) {
      return true;
    }
    return false;
  }
}

