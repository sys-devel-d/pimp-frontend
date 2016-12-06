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
  let messageContainer: DebugElement;
  let date:string;

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
    expect(component).toBeTruthy();
  });
});
