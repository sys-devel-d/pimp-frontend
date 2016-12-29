import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Globals } from '../commons/globals';
import { AuthService } from './auth.service';

@Injectable()
export default class WebSocketService {

  stompClient: any;
  socket: any;

  constructor(private authService: AuthService) {}

  init() {
    const socket = new SockJS(`${Globals.BACKEND}chat/?access_token=${this.authService.getToken()}`);
    this.socket = socket;
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null;
  }

  getStompClient() {
    return this.stompClient;
  }

  tearDown() {
    this.stompClient.disconnect();
    this.socket.close();
  }
}