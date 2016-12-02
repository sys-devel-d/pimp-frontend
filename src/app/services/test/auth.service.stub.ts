import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service'
import { MockBackend } from '@angular/http/testing';
import { Observable } from "rxjs";

@Injectable()
export class AuthServiceStub extends AuthService {

    logout() {

    }

    login(userName, password) {
        return Observable.of(true);
    }

    isLoggedIn() {
        return true;
    }

    getToken() {
        return "aosjdoistthidngjkdhjkghst4e89ds";
    }

    getCurrentUserName() {
        return "foo";
    }
}