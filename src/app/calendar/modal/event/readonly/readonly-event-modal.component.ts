import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalEvent } from '../../../../models/base';
import { showAppModal, hideAppModal } from '../../../../commons/dom-functions';
import { Router, ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';
import CalendarService from '../../../../services/calendar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'readonly-event-modal',
  templateUrl: './readonly-event-modal.component.html'
})
export default class ReadOnlyEventModalComponent implements OnInit, OnDestroy {

  private event: CalEvent = new CalEvent();
  private calendarTitle: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private calendarService: CalendarService) {}

  showDialog(event: CalEvent, calendarTitle: string) {
    this.calendarTitle = calendarTitle;
    this.event = event;
    showAppModal();
  }

  ngOnInit() {
    $('#app-modal').on('hidden.bs.modal', () => {
      this._location.back();
    });

    this.route.params.subscribe(params => {
      const eventId = params['eventId'];
      const event = this.calendarService.getEvents().find(evt => evt.key === eventId);
      if(event) {
        this.setEvent(event);
        showAppModal();
      }
      else {
        this.retryDisplayOfReadOnlyEvent(eventId);
      }
      
    });
  }

  ngOnDestroy() {
    $('#app-modal').off('hidden.bs.modal');
    hideAppModal();
  }

  private navigateToUser(user: string) {
    this.router.navigate(['/profile', user]);
  }

  private setEvent(event: CalEvent) {
    this.event = event;
    this.calendarTitle = this.calendarService.getCalendarByKey(this.event.calendarKey).title;
  }

  private retryDisplayOfReadOnlyEvent(eventId) {
    Observable.timer(0, 250) // begin right away and retry every 250ms
      .take(12) // Try for 12 * 250 ms = 3s maximum
      .takeWhile(_ => !this.calendarService.isInitialized) // immediately return if calendar is initialized
      .last() // subscribe only to last result
      .subscribe(_ => {
        const event: CalEvent = this.calendarService.getEvents().find(evt => evt.key === eventId);
        if (event) {
          this.setEvent(event);
          showAppModal();
        }
        else {
          alert("Dieser Termin existiert nicht oder Sie abonnieren den entsprechenden Kalender nicht.");
          this.router.navigate(['calendar']);
        }
      });
  }

}
