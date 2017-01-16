import { Injectable } from '@angular/core';
import { MessageService } from '../message.service';
import { Observable } from "rxjs";
import { Message, Room } from '../../models/base';
import { Http } from '@angular/http';
import { Globals } from '../../commons/globals';

const generalMessages: Message[] = [
  {
      message: "Hi",
      key: "34890zewuhjdf9324",
      userName: "test1",
      creationDate: new Date(1479842165 * 1000)
  },
  {
      message: "Hu",
      key: "dfgdfh446zegtdgfd",
      userName: "test2",
      creationDate: new Date(1479842175 * 1000)
  },
];

const watercoolerMessages = [
  {
    message: "Bitte ein Bit!",
    key: "dsadas56457uztgfjughed",
    userName: "Napoleon",
    creationDate: new Date(1479842165 * 1000)
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