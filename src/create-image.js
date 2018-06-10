import { addClass } from './.utils/class-polyfill'
import updateImage from './update-image'

function createImage(elem, spec) {
    addClass(
        elem.parentElement,
        spec.container
    )
    updateImage(elem, spec)
    return elem
}

export default createImage
