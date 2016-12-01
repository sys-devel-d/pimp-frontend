import { Injectable } from '@angular/core';
import { UserService } from '../user.service';
import { Observable } from "rxjs";
import { Message } from '../../models/base'

@Injectable()
export class UserServiceStub extends UserService {
    
  getProfileInformation() {
      return Observable.of(
          {
            userName: "foo",
            password: "secret",
            firstName: "foobart",
            lastName: "bar",
            email: "foo@bar.de"
          }
      );
  }

}