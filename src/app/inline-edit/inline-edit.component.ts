import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'inline-edit',
  templateUrl: './inline-edit.component.html'
})
export default class InlineEdit {
  private isDisplay = true;

  @Input() text: string;
  @Input() isEditable: boolean;
  @Output() edit = new EventEmitter<string>();

  private beginEdit(el: HTMLElement): void {
    if(this.isEditable) {
      this.isDisplay = false;

      setTimeout(() => {
        el.focus();
      }, 100);
    }
  }

  private editDone(newText: string): void {
    this.isDisplay = true;
    this.text = newText;
    this.edit.emit(this.text);
  }

  private abortEditing() {
    this.isDisplay = true;
  }
}