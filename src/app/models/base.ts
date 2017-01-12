import { CalendarEvent, CalendarEventAction } from 'angular-calendar';

export class Message {
  creationDate: Date;
  userName: string;
  message: string;
  key: string;
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
  invited: string[];
  declined: string[];
  actions?: CalendarEventAction[];
}

export type NotificationType = 'NEW_MESSAGE' | 'NEW_CHAT' | 'EVENT_UPDATE' | 'EVENT_INVITATION' | 'EVENT_DELETION';
export type NotificationIntent = 'success' | 'alert' | 'info' | 'error';

export class Notification extends Message {
  type: NotificationType;
  intent: NotificationIntent = 'info';
  acknowledged: boolean;
  referenceKey: string;
  referenceParentKey: string;
  sendingUser: string;
  receivingUser: string;
}

export class InvitationResponse {
  public static readonly ACCEPTED = 'ACCEPTED';
  public static readonly DECLINED = 'DECLINED';

  userName: string;
  state: string;
  answer: string;
  eventKey: string;
  calendarKey: string;
  invitee: string;

}

export interface Notifications {
  [type: string]: Notification[]
}
