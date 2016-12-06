import { Component, OnInit } from '@angular/core';
import { User } from "../models/base";
import { UserService } from "../services/user.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User;

  constructor(private userService: UserService) {
    this.userService.userChange.subscribe( (user:User) => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
  }
}
