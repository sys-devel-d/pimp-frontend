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
  photoFile: File;

  constructor(userService: UserService) {
    this.userService = userService;
    this.errorSubscription = userService.errorChange
      .subscribe( err => this.error = err );
    this.subscribeToUserChange();
  }

  private onEditStatus(status) {
    status = status.trim();
    if(status != this.user.status && this.isPrivate) {
      this.userService.editStatus(status)
      .subscribe(
        res => {
          this.user.status = status;
        },
        error => {
          this.error = `Fehler: ${error}`;
        }
      );
    }
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
        .postUserPhoto(this.user.userName, imageData);
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
