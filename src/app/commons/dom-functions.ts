declare var $:any;

export function shakeInput(selector:string) {
    $(selector).addClass('invalid-params');
    setTimeout( () => {
        $(selector).removeClass('invalid-params');
    }, 500);
}

export function showChatModal() {
    $('#chat-modal').modal('show');
}

export function hideChatModal() {
    $('#chat-modal').modal('hide');
}

export function showCalendarModal() {
    $('#calendar-event-editor-modal').modal('show');
}

export function hideCalendarModal() {
  $('#calendar-event-editor-modal').modal('hide');
}

export function showAppModal() {
    $('#app-modal').modal('show');
}

export function hideAppModal() {
    $('#app-modal').modal('hide');
}
