import { Injectable } from '@angular/core';
import { UserService } from '../user.service';
import { Observable } from "rxjs";
import { User } from "../../models/base";

@Injectable()
export class UserServiceStub extends UserService {

  currentUser: User = {
    userName: "foo",
    password: "secret",
    firstName: "foobart",
    lastName: "bar",
    email: "foo@bar.de",
    photo: null,
    photoData: null,
    status: null
  };

  getProfileInformation() {
      return Observable.of(
          this.currentUser
      );
  }

}
