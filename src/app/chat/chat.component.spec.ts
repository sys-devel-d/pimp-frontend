/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChatComponent } from './chat.component';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';
import { MessageServiceStub } from '../services/test/message.service.stub';
import { UserServiceStub } from '../services/test/user.service.stub';

import { UserSearchComponent } from "../user-search/user-search.component";
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from '../directives/highlight.directive';

import { BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, ConnectionBackend } from '@angular/http';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let messageContainer: DebugElement
  let buttons: DebugElement

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ ChatComponent, UserSearchComponent, HighlightDirective ],
      providers: [
        {
          provide: MessageService, useClass: MessageServiceStub
        },
        {
          provide: UserService, useClass: UserServiceStub
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    messageContainer = fixture.debugElement.query(By.css('#chat-message-container'));
    buttons = fixture.debugElement.query(By.css('#change-room-btn-container'))
  });

  it('should show messages', () => {
    const messages = messageContainer.children;
    expect(messages.length).toBe(2);
    const [msg1, msg2] = messages;
    expect(msg1.nativeElement.textContent.trim())
        .toEqual('[11/22/2016, 8:16:05 PM] => test1: Hi')
    expect(msg2.nativeElement.textContent.trim())
        .toEqual('[11/22/2016, 8:16:15 PM] => test2: Hu')
  });

  it('should switch between rooms by clicking buttons', () => {
    fixture.detectChanges();
    const messages = messageContainer.children;
    expect(messages.length).toBe(2);
    const [btn1, btn2] = buttons.children;
    expect(btn1.nativeElement.textContent.trim())
        .toEqual("general");
    expect(btn2.nativeElement.textContent.trim())
        .toEqual("watercooler");
    btn2.nativeElement.click();
    fixture.detectChanges();
    expect(messageContainer.children.length).toBe(1);
    const [msg] = messageContainer.children;
    expect(msg.nativeElement.textContent.trim())
        .toEqual('[11/22/2016, 8:16:05 PM] => Napoleon: Bitte ein Bit!');

  });
});
