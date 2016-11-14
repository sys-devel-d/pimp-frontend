import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [MessageService]
})
export class ChatComponent implements OnInit {
  roomId: any;
  text: any;
  messageService: MessageService;
  messages: Array<String> = new Array<String>();

  constructor(messageService: MessageService) {
    this.messageService = messageService;
    this.roomId = "general"
  }

  send() {
    this.messageService.publish(this.roomId, this.text);
    this.text = "";
  }

  ngOnInit() {
    let callback = (message: any) => {
      let convertedMessage = JSON.parse(message);
      convertedMessage['date'] = new Date();
      this.messages.push(convertedMessage);
    }
    this.messageService.subscribe(this.roomId, callback);
  }
}
