function boundingOffset(image, container) {
    let aspect = image.naturalWidth / image.naturalHeight,
        boundWidth = container.clientHeight * aspect,
        boundHeight = container.clientWidth / aspect
    return {
        width: container.clientWidth - boundWidth,
        height: container.clientHeight - boundHeight
    }
}

export default boundingOffset
