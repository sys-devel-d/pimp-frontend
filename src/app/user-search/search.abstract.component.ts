import {Output, EventEmitter, OnInit} from '@angular/core';

export abstract class SearchComponent implements OnInit {
  update = new EventEmitter();
  results: Object[];
  term: string;
  userSearch: boolean;
  forChat: boolean;

  ngOnInit() {
    this.reset();
  }

  reset() {
    this.term = '';
    this.results = [];
    this.update.emit('');
  }
}
