import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalEvent } from '../../../../models/base';
import { showAppModal, hideAppModal } from '../../../../commons/dom-functions';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import CalendarService from '../../../../services/calendar.service';
import {DateFormatter} from "@angular/common/src/facade/intl";

@Component({
  selector: 'readonly-event-modal',
  templateUrl: './readonly-event-modal.component.html'
})
export default class ReadOnlyEventModalComponent implements OnInit, OnDestroy {

  private eventId: string;
  private event: CalEvent = new CalEvent();
  private calendarTitle: string;
  private calendarServiceIsInitialized: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private calendarService: CalendarService) {

    this.calendarService.initializedChange.subscribe(isInitialized => {
      this.calendarServiceIsInitialized = isInitialized;
      if(isInitialized) {
        this.findEventAndSet();
      }
    });
  }

  ngOnInit() {
    $('#app-modal').on('hidden.bs.modal', () => {
      this._location.back();
    });

    this.route.params.subscribe(params => {
      this.eventId = params['eventId'];
      this.findEventAndSet();
    });
  }

  ngOnDestroy() {
    $('#app-modal').off('hidden.bs.modal');
    hideAppModal();
  }

  private navigateToUser(user: string) {
    this.router.navigate(['profile', user]);
  }

  private setEvent(event: CalEvent) {
    this.event = event;
    this.calendarTitle = this.calendarService.getCalendarByKey(this.event.calendarKey).title;
  }

  private findEventAndSet() {
    const event = this.calendarService.getEvents().find(evt => evt.key === this.eventId);
    if (event) {
      this.setEvent(event);
      showAppModal();
    }
    else if(this.calendarServiceIsInitialized) {
      alert("Der Termin existiert nicht oder Sie abonnieren den entsprechenden Kalender nicht.");
      this.router.navigate(['calendar']);
    }
    // else calendarService is not initialized yet. When it is, this function will be called again.
  }

  private formatDate(date) {
    return DateFormatter.format(date, 'de', 'dd.MM.yyyy HH:mm');
  }

}
