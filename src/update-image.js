import { hasClass, addClass, removeClass } from './.utils/class-list'
import boundingOffset from './.internal/bounding-offset'

const shouldFitHorizontal = check => element => {
    return check(boundingOffset(element, element.parentElement))
}

const typeCover = shouldFitHorizontal(offset => {
    return offset.width > offset.height
})

const typeContain = shouldFitHorizontal(offset => {
    return offset.width < offset.height
})

function updateImage(image, spec) {
    const { element } = image
    const { horizontal, vertical, cover } = spec

    let predicate = hasClass(element, cover) ? typeCover : typeContain,
        className = predicate(element) ? horizontal : vertical

    if (!hasClass(element, className)) {
        removeClass(element, className !== horizontal ? horizontal : vertical)
        addClass(element, className)
    }
}

export default updateImage
