import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CalendarModule } from 'angular-calendar';
import {Ng2DatetimePickerModule } from 'ng2-datetime-picker';

import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import CalendarEventEditorComponent from './calendar/event-editor/calendar-event-editor.component';
import { ChatComponent } from './chat/chat.component';
import GroupChatEditorComponent from './chat/editor/group-chat-editor.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from "@angular/router";
import { ProfileComponent } from './profile/profile.component';
import { OtherProfileComponent } from './profile/other-profile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from "./commons/auth.guard";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import CalendarService from './services/calendar.service';
import { MessageService } from "./services/message.service";
import { UserSearchComponent } from "./user-search/user-search.component";
import { HighlightDirective } from './directives/highlight.directive';
import { RoomNamePipe } from './pipes/room-name.pipe'

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    CalendarEventEditorComponent,
    ChatComponent,
    GroupChatEditorComponent,
    LoginComponent,
    ProfileComponent,
    OtherProfileComponent,
    PageNotFoundComponent,
    RegisterComponent,
    UserSearchComponent,
    HighlightDirective,
    RoomNamePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2DatetimePickerModule,
    CalendarModule.forRoot(),
    RouterModule.forRoot([
      { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
      { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
      { path: 'login', component: LoginComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'profile/:userName', component: OtherProfileComponent, canActivate: [AuthGuard] },
      { path: 'register', component: RegisterComponent },
      { path: '', component: LoginComponent },
      { path: '**', component: PageNotFoundComponent }
    ])
  ],
  providers: [
    AuthGuard,
    AuthService,
    MessageService,
    UserService,
    CalendarService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
