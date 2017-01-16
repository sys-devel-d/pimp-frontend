import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): boolean {
    const storageUser = localStorage.getItem('currentUser');
    if (storageUser) {
      const user = JSON.parse(storageUser);
      if (Date.now() < user.expiresAt) {
        return true;
      }
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}
