import {Component, Input, Output, EventEmitter} from '@angular/core';
import {SearchComponent} from './search.abstract.component';

@Component({
  selector: 'app-user-search-field',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class UserSearchComponent extends SearchComponent {
  @Output() update = new EventEmitter();
  @Input() results: Object[] = [];
  @Input() privateChatCallback: Function;
  @Input() groupChatCallback: Function;

  constructor() {
    super();
    this.userSearch = true;
    this.forChat = true;
  }

  privateChat(item) {
    this.privateChatCallback(item);
    this.results = [];
    this.term = '';
  }

  groupChat(item) {
    this.groupChatCallback(item);
    this.results = [];
    this.term = '';
  }
}
