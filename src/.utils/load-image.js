function loadImage(image, callback) {
    if (image == null || callback == null) {
        return
    }
    if (image.complete) {
        callback(
            image,
            image.naturalWidth,
            image.naturalHeight
        )
    } else {
        let src = image.src || image
        if (typeof image === 'string') {
            image = new Image()
            image.src = src
        }
        image.onload = () => {
            callback(
                image,
                image.naturalWidth,
                image.naturalHeight
            )
        }
    }
}

export default loadImage
