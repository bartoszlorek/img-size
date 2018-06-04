import ResizeSensor from 'resize-sensor'
import { addClass } from './.utils/class-list'
import handleResize from './handle-resize'

function createImage(element, spec) {
    const image = {
        element,
        handler: new ResizeSensor(
            element.parentElement,
            () => handleResize(image, spec)
        )
    }
    addClass(
        element.parentElement,
        spec.container
    )
    return image
}

export default createImage
