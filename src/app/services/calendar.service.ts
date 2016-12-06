import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { CalendarEvent } from 'angular-calendar';
import { AuthService } from './auth.service';
import { CalEvent } from '../models/base';

const colors: any = {
  red:    { primary: '#ad2121', secondary: '#FAE3E3' },
  blue:   { primary: '#1e90ff', secondary: '#D1E8FF' },
  yellow: { primary: '#e3bc08', secondary: '#FDF1BA' }
};

@Injectable()
export default class CalendarService {

    viewDate: Date = new Date();
    view: string = 'month';
    activeDayIsOpen: boolean = true;
    events: CalEvent[] = [{
        start: new Date(2016, 10, 29, 12, 15),
        end: new Date(2016, 10, 29, 13, 0),
        title: 'Spring Präsentation',
        color: colors.red,
        participants: []
    }, {
        start: new Date(2016, 10, 15),
        end: new Date(2016, 10, 29),
        title: 'Zweiter Sprint',
        color: colors.yellow,
        participants: []
    }];

    constructor(private authService: AuthService, private http: Http) {}

    fetchUsersCalendars() {
        return this.http.get(
            Globals.BACKEND + 'calendar',
            { headers: this.authService.getTokenHeader() }
        ).map( (res:Response) => {
            return res.json() 
        }).subscribe( (res: Response) => {

        })
    }

    getEvents(): CalEvent[] {
        return this.events;
    }

    getViewDate(): Date {
        return this.viewDate;
    }

    getView(): string {
        return this.view;
    }

    getActiveDayIsOpen(): boolean {
        return this.activeDayIsOpen;
    }
}