import { Injectable } from '@angular/core';
import { MessageService } from '../message.service';
import { Observable } from "rxjs";
import { Message } from '../../models/message';
import { Http } from '@angular/http';
import Room from '../../models/room';
import { Globals } from '../../commons/globals'

import { AuthServiceStub } from '../../services/test/auth.service.stub'

const generalMessages = [
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
];

const watercoolerMessages = [
  {
    message: "Bitte ein Bit!",
    userName: "Napoleon",
    date: new Date(1479842165 * 1000)
  }
];

const roomgeneral = {
  roomName: 'rhefhdjkfhkjwh92zre9z23478wi',
  roomType: "GROUP",
  messages: generalMessages,
  participants: [],
  displayNames: {
    [Globals.HASH_KEY_DISPLAY_NAME_GROUP]: 'general'
  }
}

const roomWatercooler = {
  roomName: '90u90iwojdfju23rfiohwe89fhio',
  roomType: "GROUP",
  messages: watercoolerMessages,
  participants: [],
  displayNames: {
    [Globals.HASH_KEY_DISPLAY_NAME_GROUP]: 'watercooler'
  }
}

@Injectable()
export class MessageServiceStub extends MessageService {

  connected = true

  getCurrentRoom(): Room {
    return roomgeneral;
  }

  getRooms(): Room[] {
    return [roomgeneral, roomWatercooler];
  }

}