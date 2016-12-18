import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CalendarModule } from 'angular-calendar';

import { CalendarComponent } from './calendar.component';
import CalendarService from '../services/calendar.service';
import {UserService} from '../services/user.service';
import CalendarServiceStub from '../services/test/calendar.service.stub';
import {UserServiceStub} from '../services/test/user.service.stub';
import CalendarModalComponent from './modal/calendar-modal.component';
import EventModalComponent from './modal/event/event-modal.component';
import ModalDialogComponent from '../modal-dialog/modal-dialog.component';
import CreateEventModalComponent from './modal/event/create/create-event-modal.component';

import { FormsModule } from '@angular/forms';

describe('ChatComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        CalendarModule.forRoot()
      ],
      declarations: [
        CalendarComponent,
        CalendarModalComponent,
        EventModalComponent,
        CreateEventModalComponent,
        ModalDialogComponent
      ],
      providers: [
        {
          provide: CalendarService, useClass: CalendarServiceStub
        },
        {
          provide: UserService, useClass: UserServiceStub
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

    fixture.debugElement.query(By.css('.cal-open-day-events .cal-event-title')).nativeElement.click();
    fixture.detectChanges();
    // get new modal title
    modalTitle = fixture.debugElement.query(By.css('.modal-title'));
    expect(modalTitle.nativeElement.textContent.trim()).toEqual('Termin bearbeiten');
  });
});
