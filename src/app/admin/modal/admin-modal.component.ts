import { Component } from '@angular/core';
import { hideAppModal, showAppModal, shakeInput, fadeIn, fadeOut } from '../../commons/dom-functions';

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.component.html'
})
export default class AdminModalComponent {
  modalTitle: string;

  constructor() {
  }

  showDialog() {
    showAppModal();
  }
}
