import { environment } from '../../environments/environment'

export const Globals = Object.freeze({
  BACKEND: environment.BACKEND,

  CHATROOM_TYPE_PRIVATE: 'PRIVATE',
  CHATROOM_TYPE_GROUP: 'GROUP',
  HASH_KEY_DISPLAY_NAME_GROUP: '_GROUP_DISPLAY_NAME_',

  messages: {
    DELETE_EVENT_CONFIRMATION: 'Soll der Termin wirklich gelöscht werden?'
  }
});
