import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Message, MessageCollection } from '../models/message';
import { AuthService } from './auth.service';
import { Http, Response, Headers } from '@angular/http';
import { Globals } from '../commons/globals';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MessageService {

  socket: any;
  stompClient: any;
  currentRoom: string;
  currentRoomChange: Subject<string> = new Subject<string>();
  messages: MessageCollection = {};
  messagesChange : Subject<MessageCollection> = new Subject<MessageCollection>();
  rooms: string[] = [];
  roomsChange : Subject<string[]> = new Subject<string[]>();

  constructor(private authService: AuthService, private http: Http) {
    if(authService.isLoggedIn()) {
      this.init();
    }
  }

  init() {
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
        this.subscribe(rooms);
      }
    } );
  }

  /* Get all rooms in which user is member */
  getInitialRooms(): Observable<string[]> {
    let headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.authService.getToken());
    return this.http
      .get(`${Globals.BACKEND}users/${this.authService.getCurrentUserName()}/rooms`, {headers: headers})
      .map((res: Response) => {
        return res.json();
      }).catch( (error: any) => {
        return Observable.throw(error);
      });
  }

  publish(roomId: String, message: string): void {
    let userName = JSON.parse(localStorage.getItem('currentUser')).username;
    this.stompClient.send('/app/broker/' + roomId, {},
      JSON.stringify({
        message,
        roomId,
        userName
      }));
  }

  subscribe(rooms: string[]): void {
    var that = this;
    this.stompClient.connect({}, (frame) => {
      for(let roomId of rooms) {
        
        /** 
         * This maps to the @SubscripeMapping in Spring and is only
         * invoked once the user joins a room
         */
        that.stompClient.subscribe('/app/initial-messages/' + roomId, ( { body } ) => {
          let initialMessages: Message[] = JSON.parse(body).map(
            msg => this.dbEntityToMessage(msg)
          );

          // Prepend the initialMessages to the messages
          // (There could already be new messages in it from the other subscription)
          that.messages[roomId].unshift.apply(
            that.messages[roomId], initialMessages
          );

          that.messagesChange.next(this.getMessages());
          // Now we can actually unsubscribe... This will not be invoked again.
          that.stompClient.unsubscribe('/app/initial-messages/' + roomId);
        })

        that.stompClient.subscribe('/rooms/message/' + roomId, ( { body } ) => {
          let message: Message = this.dbEntityToMessage(JSON.parse(body));
          that.messages[roomId].push(message);
          //that.messagesChange.next(that.getMessages());
        })

    }
        
    }, err => console.log('err', err) );
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
    this.stompClient.disconnect()
    this.socket.close()
    this.messages = {}
    this.rooms =  []
  }

}