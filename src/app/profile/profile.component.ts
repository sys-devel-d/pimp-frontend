import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../models/base';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User;
  userService: UserService;
  subscription: Subscription;
  errorSubscription: Subscription;
  isPrivate = true;
  error: string;
  photo: any;
  photoFile: File;

  constructor(userService: UserService) {
    this.userService = userService;
    this.errorSubscription = userService.errorChange
      .subscribe( err => this.error = err );
    this.subscribeToUserChange();
  }

  subscribeToUserChange() {
    this.subscription = this.userService.userChange
      .subscribe( (user:User) => this.user = user );
  }

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
