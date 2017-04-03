let loading = [];

function loadImage(element, callback) {
    let image;

    if (typeof callback !== 'function') return;
    if (! (element && element.src !== '')) return;
    if (loading.indexOf(element.src) !== -1) {
        return;
    }
    if (element.complete) {
        callback({
            width: element.naturalWidth,
            height: element.naturalHeight
        });
        return;
    }
    loading.push(element.src);
    image = new Image();
    image.onload = function() {
        let index = loading.indexOf(this.src);
        loading.splice(index, 1);
        callback({
            width: this.width,
            height: this.height
        });
    }
    image.src = element.src;
}

 export default loadImage;