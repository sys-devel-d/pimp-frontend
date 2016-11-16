export class Message {
  date: Date
  userName; String
  message: String
}

// holds messages of all rooms
export interface MessageCollection {
  [room:string]: Message[]
}