import { hasClass, addClass, removeClass } from './.utils/class-polyfill'
import boundingOffset from './.internal/bounding-offset'

const shouldFitHorizontal = check => elem => {
    return check(boundingOffset(elem, elem.parentElement))
}

const typeCover = shouldFitHorizontal(offset => {
    return offset.width > offset.height
})

const typeContain = shouldFitHorizontal(offset => {
    return offset.width < offset.height
})

function updateImage(elem, spec) {
    const { horizontal, vertical, cover } = spec

    let isHorizontal = (hasClass(elem, cover) ? typeCover : typeContain)(elem),
        className = isHorizontal ? horizontal : vertical

    if (!hasClass(elem, className)) {
        removeClass(elem, isHorizontal ? vertical : horizontal)
        addClass(elem, className)
    }
}

export default updateImage
