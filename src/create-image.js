import ResizeSensor from 'resize-sensor'
import { addClass } from './.utils/class-list'
import updateImage from './update-image'

function createImage(element, spec) {
    let image = { element }

    if (spec.accurate) {
        image.handler = new ResizeSensor(
            element.parentElement, () => {
                updateImage(image, spec)
            }
        )
    }
    addClass(
        element.parentElement,
        spec.container
    )
    updateImage(image, spec)
    return image
}

export default createImage
