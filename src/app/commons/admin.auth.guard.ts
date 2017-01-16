import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

@Injectable()
export class AdminAuthGuard extends AuthGuard {

  constructor(router: Router, authService: AuthService) {
    super(router, authService);
  }

  canActivate(): boolean {
    const canActivate = super.canActivate();
    if(canActivate) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if(user.roles.indexOf('ROLE_ADMIN') !== -1) {
        return true;
      }
      else {
        this.router.navigate(['/profile']);
      }
    }
    return false;
  }
}
