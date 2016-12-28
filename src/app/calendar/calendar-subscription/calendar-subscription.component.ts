import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

import { Calendar, SubscribedCalendar } from '../../models/base';
import CalendarService from '../../services/calendar.service';

@Component({
  selector: 'app-calendar-subscription',
  templateUrl: './calendar-subscription.component.html',
  styleUrls: ['./calendar-subscription.component.css']
})
export default class CalendarSubscriptionComponent implements OnInit {

  @Output()
  subscribedCalendar: EventEmitter<SubscribedCalendar[]> =
    new EventEmitter<SubscribedCalendar[]>();

  private calendars: Calendar[];
  private subscribedCals: SubscribedCalendar[] = [];

  constructor(private calendarService: CalendarService) {
    this.calendarService.calendarsChange.subscribe((cals) => {
      this.subscribedCals = [];
      this.calendars = [];
      this.loadSubscribedCalendar(cals);
      this.calendars = cals;
    });
  }

  ngOnInit() {
    this.calendars = this.calendarService.getCalendars();
    this.loadSubscribedCalendar(this.calendars);
  }

  loadSubscribedCalendar(cals: Calendar[]) {
    cals.forEach(cal => this.subscribedCals.push(
      {key: cal.key, title: cal.title, subscribed: true}
    ));
  }

  clickCalendarCheckbox(key: string) {
    this.subscribedCals.map(subCal => {
      if (subCal.key === key) {
        subCal.subscribed = !subCal.subscribed;
      }
    });
    this.subscribedCalendar.emit(this.subscribedCals);
  }

  unsubscribe(key: string) {
    this.calendarService.unsubscribe(key)
      .subscribe(
        cals => {
          this.subscribedCals = [];
          this.loadSubscribedCalendar(cals);
        },
        err => console.error(err)
      );
  }
}
