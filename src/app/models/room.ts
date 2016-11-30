import { User } from './user'
import { Message } from './message'

export default class Room {
    roomName: string
    roomType: string
    messages: Message[]
    participants: User[]
    displayNames: {}
}