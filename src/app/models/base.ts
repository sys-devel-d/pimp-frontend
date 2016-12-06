import { CalendarEvent } from 'angular-calendar';

export class Message {
  creationDate: Date
  userName: string
  message: string
}

export class Room {
    roomName: string
    roomType: string
    messages: Message[]
    participants: User[]
    displayNames: {}
}

export class User {
  userName: string
  password: string
  firstName: string
  lastName: string
  email: string
}

export class Calendar {
  key: string
  title: string
  isPrivate: boolean
  subscribers: User[]
  events: Event[]
}

export class CalEvent implements CalendarEvent {
  key?: string
  start: Date
  end: Date
  title: string
  color: any
  participants: string[]
}
