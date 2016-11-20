import { Component } from '@angular/core';
import {
  subDays,
  addDays,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from 'date-fns';
import { Subject } from 'rxjs/Subject';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';

const colors: any = {
  red:    { primary: '#ad2121', secondary: '#FAE3E3' },
  blue:   { primary: '#1e90ff', secondary: '#D1E8FF' },
  yellow: { primary: '#e3bc08', secondary: '#FDF1BA' }
};

@Component({
  selector: 'angular-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {

  view: string = 'month';

  viewDate: Date = new Date();

  activeDayIsOpen: boolean = true;

  actions: CalendarEventAction[] = [{
  }];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [{
    start: new Date(2016, 10, 29, 12, 15),
    end: new Date(2016, 10, 29, 13, 0),
    title: 'Spring Präsentation',
    color: colors.red
  }, {
    start: new Date(2016, 10, 15),
    end: new Date(2016, 10, 29),
    title: 'Zweiter Sprint',
    color: colors.yellow
  }];

  increment(): void {
    const addFn: any = {
      day: addDays,
      week: addWeeks,
      month: addMonths
    }[this.view];
    this.viewDate = addFn(this.viewDate, 1);
  }

  decrement(): void {
    const subFn: any = {
      day: subDays,
      week: subWeeks,
      month: subMonths
    }[this.view];
    this.viewDate = subFn(this.viewDate, 1);
  }

  today(): void {
    this.viewDate = new Date();
  }

  dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {
    if (isSameMonth(date, this.viewDate)) {
      if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next();
  }
}
