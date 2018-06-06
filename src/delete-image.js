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

    image.element = null
    if (spec.accurate) {
        image.handler.detach()
        image.handler = null
    }
}

export default deleteImage
