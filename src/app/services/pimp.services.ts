import { Injectable } from '@angular/core';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';
import CalendarService from '../services/calendar.service';
import GroupsService from '../services/groups.service';
import NotificationService from '../services/notification.service';
import WebsocketService from '../services/websocket.service';

export interface IPimpService {
  init(): void;
  tearDown(): void;
}

@Injectable()
export default class PimpServices implements IPimpService {

  services: IPimpService[];
  websocketServices: IPimpService[];

  constructor(messageService: MessageService,
              calendarService: CalendarService,
              userService: UserService,
              groupsService: GroupsService,
              notificationService: NotificationService,
              websocketService: WebsocketService) {

                websocketService.connectedChange.subscribe( frame => {
                  this.initWebsocketServices();
                });

                this.services = [
                  websocketService,
                  calendarService,
                  userService,
                  groupsService
                ];

                this.websocketServices = [
                  messageService,
                  notificationService
                ];
                
              }
    
  initWebsocketServices() {
    this.websocketServices.forEach( s => s.init());
  }

  init() {
    this.services.forEach(s => s.init());
  }

  tearDown() {
    this.services.forEach(s => s.tearDown());
    this.websocketServices.forEach(s => s.tearDown());
  }
}