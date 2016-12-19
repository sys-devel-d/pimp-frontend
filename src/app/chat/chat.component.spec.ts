import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChatComponent } from './chat.component';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';
import { MessageServiceStub } from '../services/test/message.service.stub';
import { UserServiceStub } from '../services/test/user.service.stub';

import { UserSearchComponent } from '../user-search/user-search.component';
import UserSelectionComponent from '../user-selection/user-selection.component';
import GroupChatEditorComponent from '../chat/editor/group-chat-editor.component';
import ModalDialogComponent from '../modal-dialog/modal-dialog.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HighlightDirective } from '../directives/highlight.directive';
import { RoomNamePipe } from '../pipes/room-name.pipe';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let messageContainer: DebugElement;
  let date:string;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule ],
      declarations: [ 
        ChatComponent,
        UserSearchComponent,
        HighlightDirective,
        RoomNamePipe,
        GroupChatEditorComponent,
        ModalDialogComponent,
        UserSelectionComponent
      ],
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
    expect(msg1.query(By.css('span.message')).nativeElement.textContent.trim())
        .toBe('Hi');
    expect(msg1.query(By.css('span.name')).nativeElement.textContent.trim())
        .toBe('test1:');
    date = msg1.query(By.css('span.date')).nativeElement.textContent.trim()
    expect(date).not.toBe('Invalid Date');
    expect(date).toBeTruthy();
    expect(msg2.query(By.css('span.message')).nativeElement.textContent.trim())
        .toBe('Hu');
    expect(msg2.query(By.css('span.name')).nativeElement.textContent.trim())
        .toBe('test2:');
    date = msg2.query(By.css('span.date')).nativeElement.textContent.trim();
    expect(date).not.toBe('Invalid Date');
    expect(date).toBeTruthy();
  });

  it('should switch between when clicking on room', () => {
    const roomContainers = fixture.debugElement.query(By.css('#room-container'));
    const [btn1, btn2] = roomContainers.children;
    expect(btn1.query(By.css('.roomname')).nativeElement.textContent.trim())
        .toEqual("general");
    expect(btn2.query(By.css('.roomname')).nativeElement.textContent.trim())
        .toEqual("watercooler");
    btn2.nativeElement.click();
    fixture.detectChanges();
    expect(messageContainer.children.length).toBe(1);
    const [msg] = messageContainer.children;
    expect(msg.query(By.css('span.message')).nativeElement.textContent.trim())
        .toContain('Bitte ein Bit!');
    expect(msg.query(By.css('span.name')).nativeElement.textContent.trim())
        .toContain('Napoleon:');
    date = msg.query(By.css('span.date')).nativeElement.textContent.trim();
    expect(date).not.toBe('Invalid Date');
    expect(date).toBeTruthy();

  });
  
});
