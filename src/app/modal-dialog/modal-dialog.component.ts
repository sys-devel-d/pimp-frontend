import {Component, Input} from '@angular/core';

@Component({
  selector: 'modal-dialog',
  template: `
    <div id="app-modal" class="modal fade">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">

          <div class="modal-header centered-content">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h2 class="modal-title">
              {{ title }}
            </h2>
          </div>

          <div class="modal-body">
            <ng-content select="[modal-body]"></ng-content>
          </div>

          <div class="modal-footer">
            <ng-content select="[modal-footer]"></ng-content>
          </div>

        </div>
      </div>
    </div>
  `
})
export default class ModalDialogComponent {
  @Input() private title: string;
}