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
  photoFile: File;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit() {
    this.setCurrentUser();
  }

  uploadPhoto() {
    this.getImageData((e) => {
      let imageData = e.target.result;
      this.userService
        .postUserPhoto(this.user.userName, imageData)
        .subscribe(
          photo => {
            let data = JSON.parse(photo);
            this.photo = data.files;
          },
          error => this.error = <any>error
        );
    });
  }

  fileChangeEvent(fileInput: any){
    this.photoFile = fileInput.target.files[0];
  }

  getImageData(onLoadCallback) {
    let fr = new FileReader();
    fr.onload = onLoadCallback;
    fr.readAsDataURL(this.photoFile);
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
                photo => {
                  let data = JSON.parse(photo);
                  this.photo = data.files;
                },
                error => this.error = <any>error
              );
          }
        },
        error => this.error = <any>error
      );
  }
}
