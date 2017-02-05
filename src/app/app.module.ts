import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CalendarModule } from 'angular-calendar';

import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';
import GroupChatEditorComponent from './chat/editor/group-chat-editor.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import DashboardComponent from './dashboard/dashboard.component';
import { OtherProfileComponent } from './profile/other-profile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './commons/auth.guard';
import { AdminAuthGuard } from './commons/admin.auth.guard';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import GroupsService from './services/groups.service';
import CalendarService from './services/calendar.service';
import { MessageService } from "./services/message.service";
import NotificationService from './services/notification.service';
import WebsocketService from './services/websocket.service';
import PimpServices from './services/pimp.services';
import { UserSearchComponent } from "./user-search/user-search.component";
import { AllUserSearchComponent } from './user-search/all-user-search.component';
import { CalendarSearchComponent } from './user-search/calendar-search.component';
import { HighlightDirective } from './directives/highlight.directive';
import { RoomNamePipe } from './pipes/room-name.pipe';
import InlineEdit from './inline-edit/inline-edit.component';

import ModalDialogComponent from './modal-dialog/modal-dialog.component';
import CalendarModalComponent from './calendar/modal/calendar-modal.component';
import EditEventModalComponent from './calendar/modal/event/edit-event-modal.component';
import CreateEventModalComponent from './calendar/modal/event/create-event-modal.component';
import ReadOnlyEventModalComponent from './calendar/modal/event/readonly/readonly-event-modal.component';
import UserSelectionComponent from './user-selection/user-selection.component';
import UserInvitationComponent from './user-invitation/user-invitation.component';
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import CalendarSubscriptionComponent from './calendar/calendar-subscription/calendar-subscription.component';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AdminComponent } from './admin/admin.component';
import { ColorPickerModule } from 'angular2-color-picker';

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    DashboardComponent,
    CalendarModalComponent,
    CalendarSubscriptionComponent,
    ChatComponent,
    GroupChatEditorComponent,
    LoginComponent,
    ProfileComponent,
    OtherProfileComponent,
    PageNotFoundComponent,
    RegisterComponent,
    UserSearchComponent,
    CalendarSearchComponent,
    HighlightDirective,
    RoomNamePipe,
    InlineEdit,
    ModalDialogComponent,
    EditEventModalComponent,
    CreateEventModalComponent,
    ReadOnlyEventModalComponent,
    UserSelectionComponent,
    UserInvitationComponent,
    AdminComponent,
    AllUserSearchComponent
  ],
  imports: [
    BrowserModule,
    SimpleNotificationsModule.forRoot(),
    FormsModule,
    HttpModule,
    NKDatetimeModule,
    ColorPickerModule,
    CalendarModule.forRoot(),
    RouterModule.forRoot([
      { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard],
        children: [
          { path: '' },
          { path: 'event/:eventId', component: ReadOnlyEventModalComponent, canActivate: [AuthGuard] },
        ]
      },
      { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'profile/:userName', component: OtherProfileComponent, canActivate: [AuthGuard] },
      { path: 'admin', component: AdminComponent, canActivate: [AdminAuthGuard] },
      { path: 'register', component: RegisterComponent },
      { path: '', component: LoginComponent },
      { path: '**', component: PageNotFoundComponent }
    ])
  ],
  providers: [
    AuthGuard,
    AdminAuthGuard,
    AuthService,
    MessageService,
    UserService,
    CalendarService,
    GroupsService,
    NotificationService,
    WebsocketService,
    PimpServices
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
