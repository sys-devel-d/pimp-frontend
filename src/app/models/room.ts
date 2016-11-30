import { User } from './user'
import { Message } from './message'

export default class Room {
    roomName: string
    roomType: boolean
    messages: Message[]
    participants: User[]
}