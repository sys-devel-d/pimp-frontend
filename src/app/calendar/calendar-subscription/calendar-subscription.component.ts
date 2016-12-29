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

  private subscribedCals: SubscribedCalendar[] = [];

  constructor(private calendarService: CalendarService) {
    this.calendarService.calendarsChange.subscribe((cals) => {
      this.subscribedCals = this.calendarService.getSubscribedCalendars();
    });
  }

  ngOnInit() {
    this.subscribedCals = this.calendarService.getSubscribedCalendars();
  }

  clickCalendarCheckbox(key: string) {
    this.subscribedCals.map(subCal => {
      if (subCal.key === key) {
        subCal.subscribed = !subCal.subscribed;
      }
    });
    this.calendarService.setSubscribedCalendars(this.subscribedCals);
    this.subscribedCalendar.emit(this.subscribedCals);
  }

  unsubscribe(key: string) {
    this.calendarService.unsubscribe(key)
      .subscribe(
        cals => {
          this.subscribedCals = [];
        },
        err => console.error(err)
      );
  }
}
