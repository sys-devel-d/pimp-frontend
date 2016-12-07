import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CalendarModule } from 'angular-calendar';

import { CalendarComponent } from './calendar.component';
import CalendarService from '../services/calendar.service';
import CalendarServiceStub from '../services/test/calendar.service.stub';

//import { FormsModule } from '@angular/forms';

describe('ChatComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CalendarModule.forRoot()],
      declarations: [ 
        CalendarComponent
      ],
      providers: [
        {
          provide: CalendarService, useClass: CalendarServiceStub
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
});
