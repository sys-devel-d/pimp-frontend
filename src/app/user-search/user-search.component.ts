import {Component, Output, EventEmitter, OnInit, Input} from '@angular/core';

@Component({
  selector: 'searchField',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {
  @Output() update = new EventEmitter();
  @Input() results: Object[];
  @Input() privateChatCallback: Function;
  @Input() groupChatCallback: Function;
  term: string;

  ngOnInit() {
    this.reset();
  }

  reset() {
    this.term = '';
    this.results = [];
    this.update.emit('');
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
