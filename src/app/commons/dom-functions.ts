declare var $: any;

export function shakeInput(selector: string) {
  $(selector).addClass('invalid-params');
  setTimeout(() => {
    $(selector).removeClass('invalid-params');
  }, 500);
}

export function showAppModal() {
  $('#app-modal').modal('show');
}

export function hideAppModal() {
  $('#app-modal').modal('hide');
}

export function scrollDownChatMessageContainer() {
  setTimeout(() => {
    $("#chat-message-container").scrollTop($("#chat-message-container")[0].scrollHeight);
  }, 100);
}
