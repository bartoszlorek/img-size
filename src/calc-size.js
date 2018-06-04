import { hasClass, addClass, removeClass } from './.utils/class-list'
import sizeMethod from './.internal/size-method'

const coverMethod = sizeMethod((offset, h, v) => {
    return offset.width > offset.height ? h : v
})

const containMethod = sizeMethod((offset, h, v) => {
    return offset.width < offset.height ? h : v
})

function calcSize(image, spec) {
    const { element } = image
    const { horizontal, vertical, cover } = spec

    let method = hasClass(element, cover) ? coverMethod : containMethod,
        className = method(element, horizontal, vertical)

    if (!hasClass(element, className)) {
        removeClass(element, horizontal)
        removeClass(element, vertical)
        addClass(element, className)
    }
}

export default calcSize
