export function addResize(callback, throttleDelay, debounceDelay) {
    if (typeof throttleDelay !== 'number') throttleDelay = 0;
    if (typeof debounceDelay !== 'number') debounceDelay = 0;
    if (typeof callback !== 'function') {
        return false;
    }
    let throttled = false,
        timeout = false;

    function onResize() {
        if (! throttled) {
            callback();
            if (throttleDelay > 0) {
                throttled = true;
                setTimeout(() => {
                    throttled = false
                }, throttleDelay);
            }  
        }
        if (debounceDelay > 0) {
            clearTimeout(timeout);
            timeout = setTimeout(
                callback,
                debounceDelay
            );
        }
    }
    window.addEventListener('resize', onResize);
    return onResize;
}

export function removeResize(bindedFunction) {
    if (typeof bindedFunction === 'function') {
        window.removeEventListener('resize', bindedFunction);
    }
}

export default addResize;