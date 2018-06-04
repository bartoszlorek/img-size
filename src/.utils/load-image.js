function loadImage(source, callback) {
    if (source == null || callback == null) {
        return
    }
    if (source.complete) {
        callback(
            source,
            source.naturalWidth,
            source.naturalHeight
        )
    } else {
        let path = source.src || source
        if (typeof path !== 'string') {
            return
        }
        let image = new Image()
        image.onload = () => {
            callback(
                source,
                image.naturalWidth,
                image.naturalHeight
            )
        }
        image.src = path
    }
}

export default loadImage
