import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Message, MessageCollection } from '../models/message';
import { AuthService } from './auth.service';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user';

@Injectable()
export class MessageService {

  private socket: any;
  private stompClient: any;
  connected = false;
  private currentRoom: string;
  currentRoomChange: Subject<string> = new Subject<string>();
  private messages: MessageCollection = {};
  messagesChange : Subject<MessageCollection> = new Subject<MessageCollection>();
  private rooms: string[] = [];
  roomsChange : Subject<string[]> = new Subject<string[]>();

  constructor(private authService: AuthService, private http: Http) {}

  init() {
    if(!this.connected) {
      this.getInitialRooms().subscribe( (rooms: string[]) => {
        let socket = new SockJS(`${Globals.BACKEND}chat/?access_token=${this.authService.getToken()}`);
        this.socket = socket;
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null;

        if(rooms.length > 0) {
          
          /**
           * Each room in the `message: MessageCollection` must be 
           * initialized with an empty array,
           * otherwise we cannot push/unshift
           */
          for(let room of rooms) {
            this.messages[room] = [];
          }

          this.setCurrentRoom(rooms[0]);
          this.setRooms(rooms);
          this.connectAndSubscribeMultiple(rooms);
        }
        this.connected = true;
      });
    }
  }

  /* Get all rooms in which user is member */
  private getInitialRooms(): Observable<string[]> {
    return this.http
      .get(
        `${Globals.BACKEND}users/${this.authService.getCurrentUserName()}/rooms`,
        { headers: this.authService.getTokenHeader() }
      )
      .map((res: Response) => {
        return res.json();
      }).catch( (error: any) => {
        return Observable.throw(error);
      });
  }

  publish(roomId: String, message: string): void {
    let userName = this.authService.getCurrentUserName();
    this.stompClient.send('/app/broker/' + roomId, {},
      JSON.stringify({
        message,
        roomId,
        userName
      }));
  }

  initPrivateChat(user: User) {
    console.log(user);
    /**
     * Now make POST call to API requesting initialization of room with `user`.
     * The API should generate a unique (md5?) room name and check if it already exists.
     * The API's answer must include the room name.
     */
    //this.subscribeToRoom(roomName);
  }

  private connectAndSubscribeMultiple(rooms: string[]): void {
    this.stompClient.connect({}, (/*frame*/) => {
      for(let room of rooms) {
        this.subscribeToRoom(room);
      }
        
    }, err => console.log('err', err) );
  }

  private subscribeToRoom(room) {
    /**
     * This maps to the @SubscripeMapping in Spring and is only
     * invoked once the user joins a room
     */
    const url = `/app/initial-messages/${room}/${this.authService.getCurrentUserName()}`;
    this.stompClient.subscribe(url, ( { body } ) => {
      let initialMessages: Message[] = JSON.parse(body).map(
        msg => this.dbEntityToMessage(msg)
      );

      // Prepend the initialMessages to the messages
      // (There could already be new messages in it from the other subscription)
      this.messages[room].unshift.apply(
        this.messages[room], initialMessages
      );

      // that.messagesChange.next(this.getMessages());
      // Now we can actually unsubscribe... This will not be invoked again.
      this.stompClient.unsubscribe('/app/initial-messages/' + room);
    })

    this.stompClient.subscribe('/rooms/message/' + room, ( { body } ) => {
      let message: Message = this.dbEntityToMessage(JSON.parse(body));
      this.messages[room].push(message);
      //that.messagesChange.next(that.getMessages());
    });
  }

  private dbEntityToMessage(dbMessage): Message {
    const date = new Date(dbMessage.creationDate.epochSecond * 1000)
    return {
      message: String(dbMessage.message),
      userName: String(dbMessage.userName),
      date
    }
  }

  getMessages(): MessageCollection {
    return this.messages;
  }

  getCurrentRoom(): string {
    return this.currentRoom;
  }

  setCurrentRoom(room): void {
    this.currentRoomChange.next(room);
    this.currentRoom = room;
  }

  getRooms(): String[] {
    return this.rooms;
  }

  setRooms(rooms: string[]) {
    this.rooms = rooms;
    this.roomsChange.next(rooms);
  }

  tearDown(): void {
    this.stompClient.disconnect();
    this.socket.close();
    this.messages = {};
    this.rooms =  [];
    this.connected = false;
  }

}