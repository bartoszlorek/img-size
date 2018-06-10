import { removeClass } from './.utils/class-polyfill'

function deleteImage(elem, spec) {
    removeClass(
        elem.parentElement,
        spec.container
    )
    removeClass(elem, [
        spec.horizontal,
        spec.vertical
    ])
    return null
}

export default deleteImage
