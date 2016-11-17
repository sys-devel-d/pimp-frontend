export class Message {
  date: Date
  userName: string
  message: string
}

// holds messages of all rooms
export interface MessageCollection {
  [room:string]: Message[]
}