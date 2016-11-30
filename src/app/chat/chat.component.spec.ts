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
import { JDatePipe } from '../pipes/jdate-pipe'

import { BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, ConnectionBackend } from '@angular/http';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let messageContainer: DebugElement

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ ChatComponent, UserSearchComponent, HighlightDirective, JDatePipe ],
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
    
  });

  it('should show messages', () => {
    const messages = messageContainer.children;
    expect(messages.length).toBe(2);
    const [msg1, msg2] = messages;
    expect(msg1.nativeElement.textContent.trim())
        .toContain('=> test1: Hi')
    expect(msg2.nativeElement.textContent.trim())
        .toContain('=> test2: Hu')
  });

  it('should switch between when clicking on room', () => {
    fixture.detectChanges();
    const roomContainers = fixture.debugElement.query(By.css('#room-container'));
    const messages = messageContainer.children;
    expect(messages.length).toBe(2);
    const [btn1, btn2] = roomContainers.children;
    expect(btn1.query(By.css('p')).nativeElement.textContent.trim())
        .toEqual("general");
    expect(btn2.query(By.css('p')).nativeElement.textContent.trim())
        .toEqual("watercooler");
    btn2.nativeElement.click();
    fixture.detectChanges();
    expect(messageContainer.children.length).toBe(1);
    const [msg] = messageContainer.children;
    expect(msg.nativeElement.textContent.trim())
        .toContain('=> Napoleon: Bitte ein Bit!');

  });
});
