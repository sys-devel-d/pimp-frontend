import { CalendarEvent, CalendarEventAction } from 'angular-calendar';

export class Message {
  creationDate: Date;
  userName: string;
  message: string;
}

export class Room {
  roomName: string;
  roomType: string;
  messages: Message[];
  participants: User[];
  displayNames: {};
}

export class User {
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  photo: string | null;
  photoData: any;
  status: string;
}

export class Calendar {
  key: string;
  title: string;
  isPrivate: boolean;
  owner: string;
  subscribers: User[];
  events: CalEvent[];
}

export class SubscribedCalendar {
  key: string;
  title: string;
  active: boolean;
  unsubscribable: boolean;
}

export class CalEvent implements CalendarEvent {
  key: string;
  calendarKey: string;
  start: Date;
  end: Date;
  title: string;
  place: string;
  description: string;
  allDay: boolean;
  isPrivate: boolean;
  color: any;
  creator: string;
  participants: string[];
  actions?: CalendarEventAction[];
}

export class Notification {
  message: string;
  read: boolean;
}
