import {Component, Input, Output, EventEmitter} from '@angular/core';
import {SearchComponent} from './search.abstract.component';
import {Calendar} from '../models/base';

@Component({
  selector: 'app-calendar-search-field',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class CalendarSearchComponent extends SearchComponent {
  @Output() update = new EventEmitter();
  @Input() results: Object[] = [];
  @Input() subscribeCallback: Function;

  constructor() {
    super();
    this.userSearch = false;
  }

  subscribeCalendar(cal: Calendar) {
    this.subscribeCallback(cal.key);
    this.results = [];
    this.term = '';
  }
}
