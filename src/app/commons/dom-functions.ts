declare var $:any;

export function shakeInput(selector:string) {
    $(selector).addClass('invalid-params');
    setTimeout( () => {
        $(selector).removeClass('invalid-params');
    }, 500);
}