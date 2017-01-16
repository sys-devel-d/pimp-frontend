import {Component, Input, Output, EventEmitter} from '@angular/core';
import {SearchComponent} from './search.abstract.component';

@Component({
  selector: 'app-all-user-search-field',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class AllUserSearchComponent extends SearchComponent {
  @Output() update = new EventEmitter();
  @Input() results: Object[] = [];
  @Input() addUserCallback: Function;

  constructor() {
    super();
    this.userSearch = true;
    this.forChat = false;
  }

  addUser(item) {
    this.addUserCallback(item);
    this.results = [];
    this.term = '';
  }
}
