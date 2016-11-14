import { Component, OnInit } from '@angular/core';
import { User } from "../models/user";
import { UserService } from "../services/user.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User = new User();
  userService: UserService;
  error: string;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit() {
    this.getCurrentUser();
  }

  private getCurrentUser() {
    this.userService
      .getProfileInformation()
      .subscribe(
        result => this.user = this.convertToUser(result),
        error => this.error = <any>error
      );
  }

  private convertToUser(result): User{
    let newUser = new User();
    newUser.username = result.userName;
    newUser.firstName = result.firstName;
    newUser.lastName = result.lastName;
    newUser.email = result.email;
    return newUser;
  }
}
