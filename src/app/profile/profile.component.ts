import { Component, OnInit } from '@angular/core';
import { User } from '../models/base';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User = new User();
  userService: UserService;
  error: string;
  photo: any;
  photoFile: string;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit() {
    this.setCurrentUser();
  }

  private setCurrentUser() {
    this.userService
      .getProfileInformation()
      .subscribe(
        result => {
          this.user = result as User;
          if (this.user.photo) {
            this.userService
              .getUserPhoto(this.user.userName, this.user.photo)
              .subscribe(
                photo => this.photo = photo,
                error => this.error = <any>error
              );
          }
        },
        error => this.error = <any>error
      );
  }
}
