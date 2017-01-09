import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { CalendarModule } from 'angular-calendar';

import { CalendarComponent } from './calendar.component';
import CalendarService from '../services/calendar.service';
import NotificationService from '../services/notification.service';
import NotificationServiceStub from '../services/test/notification.service.stub';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import CalendarServiceStub from '../services/test/calendar.service.stub';
import { UserServiceStub } from '../services/test/user.service.stub';
import { AuthServiceStub } from '../services/test/auth.service.stub';
import CalendarModalComponent from './modal/calendar-modal.component';
import EditEventModalComponent from './modal/event/edit-event-modal.component';
import CalendarSubscriptionComponent
  from './calendar-subscription/calendar-subscription.component';
import {CalendarSearchComponent} from '../user-search/calendar-search.component'
import ModalDialogComponent from '../modal-dialog/modal-dialog.component';
import CreateEventModalComponent from './modal/event/create-event-modal.component';
import ReadOnlyEventModalComponent from './modal/event/readonly/readonly-event-modal.component';
import UserSelectionComponent from '../user-selection/user-selection.component';
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { HighlightDirective } from '../directives/highlight.directive';

import { FormsModule } from '@angular/forms';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        CalendarModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        NKDatetimeModule
      ],
      declarations: [
        CalendarComponent,
        CalendarModalComponent,
        CalendarSearchComponent,
        CalendarSubscriptionComponent,
        CreateEventModalComponent,
        EditEventModalComponent,
        HighlightDirective,
        ModalDialogComponent,
        ReadOnlyEventModalComponent,
        UserSelectionComponent
      ],
      providers: [
        {
          provide: CalendarService, useClass: CalendarServiceStub
        },
        {
          provide: UserService, useClass: UserServiceStub
        },
        {
          provide: AuthService, useClass: AuthServiceStub
        },
        {
          provide: NotificationService, useClass: NotificationServiceStub
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show events', () => {
    const openEventContainer = fixture.debugElement.query(By.css('.cal-open-day-events'));
    expect(openEventContainer.children.length).toBe(2);
    const [evt1, evt2] = openEventContainer.children;
    expect(evt1.query(By.css('.cal-event-title')).nativeElement.textContent.trim()).toBe('Dev Meeting');
    expect(evt2.query(By.css('.cal-event-title')).nativeElement.textContent.trim()).toBe('Stakeholder Meeting');
  });

  it('opens modal both for event and calendar', () => {
    const btnOpenCalendarModal = fixture.debugElement.query(By.css('#btnOpenCalendarModal'));
    btnOpenCalendarModal.nativeElement.click();
    fixture.detectChanges();
    let modalTitle = fixture.debugElement.query(By.css('.modal-title'));
    expect(modalTitle.nativeElement.textContent.trim()).toEqual('Kalender erstellen');

    // close modal
    fixture.debugElement.query(By.css('button.close')).nativeElement.click();

    fixture.debugElement.query(By.css('#btnOpenNewEventModal')).nativeElement.click();
    fixture.detectChanges();
    // get new modal title
    modalTitle = fixture.debugElement.query(By.css('.modal-title'));
    expect(modalTitle.nativeElement.textContent.trim()).toEqual('Termin erstellen');
  });
});
