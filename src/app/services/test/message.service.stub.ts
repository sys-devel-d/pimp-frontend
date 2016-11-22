import { Injectable } from '@angular/core';
import { MessageService } from '../message.service';
import { Observable } from "rxjs";
import { Message } from '../../models/message';
import { Http } from '@angular/http';

import { AuthServiceStub } from '../../services/test/auth.service.stub'

@Injectable()
export class MessageServiceStub extends MessageService {

  connected = true
    
  getMessages() {
    return {
        general: [
          {
              message: "Hi",
              userName: "test1",
              date: new Date(1479842165 * 1000)
          },
          {
              message: "Hu",
              userName: "test2",
              date: new Date(1479842175 * 1000)
          },
        ],
        watercooler: [
          {
            message: "Bitte ein Bit!",
            userName: "Napoleon",
            date: new Date(1479842165 * 1000)
          }
        ]
    };
  }

  getCurrentRoom(): string {
    return "general";
  }

  getRooms(): String[] {
    return ["general", "watercooler"];
  }

}