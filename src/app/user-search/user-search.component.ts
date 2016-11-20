import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';

@Component({
  selector: 'searchField',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {
  @Output() update = new EventEmitter();
  @Input() results: Object[];
  @Input() callbackOnSelection: Function;
  term: string;

  ngOnInit() {
    this.reset();
  }

  reset() {
    this.term = '';
    this.results = [];
    this.update.emit('');
  }

  select(item) {
    this.callbackOnSelection(item);
    this.results = [];
  }
}
