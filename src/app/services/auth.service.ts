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
    this.roles = currentUser && currentUser.roles;
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
        const data = res.json();
        if (data) {
          this.token = data.access_token;
          this.userName = userName;
          this.roles = data.user_roles;
          localStorage.setItem('currentUser', JSON.stringify({
            userName: userName,
            token: this.token,
            expiresAt: Date.now() + (data.expires_in * 1000),
            startDate: new Date(),
            roles: this.roles
          }));
        }
        return this.token && true;
      })
      .catch( (error:any) => {
        const err = (400 <= error.status && error.status < 500) ?
                    'Zugangsdaten ungültig.' : 'Server Error'
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
    return this.roles && this.roles.indexOf('ROLE_ADMIN') !== -1;
  }
}

