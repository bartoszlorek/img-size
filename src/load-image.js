
function loadImage(element, callback) {
    let src = element && element.nodeType
           && element.getAttribute('src'),
        image;

    if (typeof src !== 'string') {
        return false;
    }
    image = new Image();
    image.onload = function() {
        if (typeof callback === 'function') {
            callback(this);
        }  
    }
    image.src = src;
}

 export default loadImage;