import { Injectable } from '@angular/core';
import CalendarService from '../calendar.service';
import { Observable } from "rxjs";
import { CalEvent } from '../../models/base';
import { Http } from '@angular/http';
import { Globals } from '../../commons/globals';

const colors: any = {
  red:    { primary: '#ad2121', secondary: '#FAE3E3' },
  blue:   { primary: '#1e90ff', secondary: '#D1E8FF' },
  yellow: { primary: '#e3bc08', secondary: '#FDF1BA' }
};

@Injectable()
export default class CalendarServiceStub extends CalendarService {

    getEvents(): CalEvent[] {
        return [{
            start: new Date(),
            end: new Date(),
            title: 'Dev Meeting',
            color: colors.red,
            participants: []
        }, {
            start: new Date(),
            end: new Date(),
            title: 'Stakeholder Meeting',
            color: colors.yellow,
            participants: []
        }];
    }

    getViewDate(): Date {
        return new Date();
    }

    getView(): string {
        return 'day';
    }

    getActiveDayIsOpen(): boolean {
        return true;
    }

}