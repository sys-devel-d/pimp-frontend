import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): Observable<boolean> {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    let expireDate = new Date(user.startDate).getTime();
    let refreshToken = user.refreshToken;

    if (localStorage.getItem('currentUser')) {
      if (Date.now() - user.expiresIn > expireDate) {
        return this.authService.reAuth(refreshToken)
        .map((result) => {
          if (!result) {
            this.router.navigate(['/login']);
            return false;
          }
          return result;
        })
        .catch((err) => {
            this.router.navigate(['/login']);
            return Observable.of(false);
        });
      } else {
        return Observable.of(true);
      }
    } else {
      this.router.navigate(['/login']);
      return Observable.of(false);
    }
  }
}
