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
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}
