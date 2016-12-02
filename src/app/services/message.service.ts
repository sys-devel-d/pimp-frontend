import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Message, User, Room } from '../models/base';
import { AuthService } from './auth.service';
import { Http, Response } from '@angular/http';
import { Globals } from '../commons/globals';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MessageService {

  private socket: any;
  private stompClient: any;
  private stompSubscriptions: Object = {};
  connected = false;
  private currentRoom: Room;
  currentRoomChange: Subject<Room> = new Subject<Room>();
  private rooms: Room[] = [];
  roomsChange: Subject<Room[]> = new Subject<Room[]>();

  chatErrorMessageChange : Subject<string> = new Subject<string>();

  constructor(private authService: AuthService, private http: Http) {}

  init() {
    if(!this.connected) {
      this.getInitialRooms().subscribe( (rooms: Room[]) => {
        let socket = new SockJS(`${Globals.BACKEND}chat/?access_token=${this.authService.getToken()}`);
        this.socket = socket;
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null;

        if(rooms.length > 0) {
          this.setCurrentRoom(rooms[0]);
          this.rooms = rooms;
          this.roomsChange.next(rooms);
        }

        this.connectAndSubscribeMultiple(rooms);
      });
    }
  }

  /* Get all rooms in which user is member */
  private getInitialRooms(): Observable<Room[]> {
    return this.http
      .get(
        `${Globals.BACKEND}rooms/`,
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
    const msg = JSON.stringify({
      message,
      roomId,
      userName
    });
    this.stompClient.send('/app/broker/' + roomId, {}, msg);
  }

  initChatWith(users: User[], roomType:string, displayName?:string) {
    for(let user of users) {
      delete user['authorities']
    }
    let url = Globals.BACKEND + 'rooms/';
    let payload:any = users;
    if(roomType == 'PRIVATE' && users.length == 1) {
      payload = users[0];
      url = url + 'init-private'
    }
    else {
      url = url + 'init-group/' + displayName
    }
    
    this.http.post(url, payload,
      {
        headers: this.authService.getTokenHeader()
      }
    )
    .map( (res: Response) => {
      if(res.status == 200) {
        return res.json() as Room;
      }
    })
    .subscribe(
      (room:Room) => {
        this.subscribeToRoom(room);
        this.rooms.push(room);
        this.roomsChange.next(this.rooms);
        this.currentRoomChange.next(room);
      },
      err => {
        const message = err.status == 409 ?
          'It seems you are already in a room with this user' :
          'We are sorry. There has been an error initializing the chatroom.'
        this.chatErrorMessageChange.next(message);
      }
    );
  }

  private connectAndSubscribeMultiple(rooms: Room[]): void {
    this.stompClient.connect({}, (/*frame*/) => {
      this.connected = true;
      for(let room of rooms) {
        this.subscribeToRoom(room);
      }
    }, err => console.log('err', err) );
  }

  private handleIncomingMessage(roomName: string, { body }) {
    let message: Message = JSON.parse(body);
    const existingMsgs = this.rooms.find( r => r.roomName == roomName).messages;
    existingMsgs.push(message);
  }

  private subscribeToRoom(room: Room): void {
    const subscription = this.stompClient.subscribe(
      '/rooms/message/' + room.roomName,
      this.handleIncomingMessage.bind(this, room.roomName)
    );
    this.stompSubscriptions[room.roomName] = subscription;
  }

  exitRoom(room: Room) {
    for(let user of room.participants) {
      delete user['authorities']
    }
    return this.http.patch(
      Globals.BACKEND + 'rooms/exit/' + room.roomName,
      room,
      { headers: this.authService.getTokenHeader() }
    ).subscribe(
      response => {
        this.stompSubscriptions[room.roomName].unsubscribe();
        this.rooms = this.rooms.filter( r => r.roomName != room.roomName );
        this.roomsChange.next(this.rooms);
      },
      err => console.log(err)
    )
  }

  editRoom(room:Room) {
    const { roomName, participants, displayNames, roomType } = room;
    return this.http.patch(
      Globals.BACKEND + "rooms/edit/",
      {
        roomName,
        participants,
        displayNames,
        roomType
      },
      { headers: this.authService.getTokenHeader() }
    )
    .map( (res: Response) => {
      return res.json()
    })
  }

  getCurrentRoom(): Room {
    return this.currentRoom;
  }

  setCurrentRoom(room:Room): void {
    this.currentRoomChange.next(room);
    this.currentRoom = room;
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  tearDown(): void {
    this.stompClient.disconnect();
    this.socket.close();
    this.rooms =  [];
    this.connected = false;
  }

}