import { removeClass } from './.utils/class-list'

function deleteImage(image, spec) {
    removeClass(
        image.element.parentElement,
        spec.container
    )
    removeClass(image.element, [
        spec.horizontal,
        spec.vertical
    ])
    image.handler.detach()
    image.handler = null
    image.element = null
}

export default deleteImage
