import { CalendarEventTitleFormatter } from 'angular-calendar';
import { CalEvent } from '../models/base';

const locale = 'de-DE';
const options = {hour: 'numeric', minute: 'numeric'};

export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {

  month(event: CalEvent): string {
    return `<b>${this.formatStart(event)}</b> ${event.title}`;
  }

  week(event: CalEvent): string {
    return this.month(event);
  }

  formatStart(event: CalEvent) {
    return event.allDay ?
      '<i class="fa fa-clock-o"></i>' :
      new Intl.DateTimeFormat('de', {hour: 'numeric', minute: 'numeric'}).format(event.start);
  }

}