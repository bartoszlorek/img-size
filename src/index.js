import objectAssign from 'object-assign'
import parseNode from './.utils/parse-node'
import loadImage from './.utils/load-image'
import createViewport from './.utils/viewport'

import injectRules from './inject-rules'
import createImage from './create-image'
import deleteImage from './delete-image'
import updateImage from './update-image'

const defaults = {
    accurate: false,
    container: 'img-size-container',
    horizontal: 'img-size-h',
    vertical: 'img-size-v',
    contain: 'img-size-contain',
    cover: 'img-size-cover'
}

let viewport = null

function imgSize(options) {
    const spec = objectAssign({}, defaults, options)
    let injected = injectRules(spec)
    let images = []

    const addImage = element => {
        images.push(createImage(element, spec))
    }

    const removeImage = element => {
        images = images.filter(image => {
            if (image.element === element) {
                return deleteImage(image, spec)
            }
            return true
        })
    }

    const updateImages = () => {
        let index = -1
        const length = images.length
        while (++index < length) {
            updateImage(images[index], spec)
        }
    }

    const isValidInstance = () => {
        if (images === null) {
            throw new Error('This ImgSize instance has been destroyed, so no operations can be performed on it.')
        }
        return true
    }

    if (!spec.accurate) {
        if (viewport === null) {
            viewport = createViewport()
        }
        viewport.on('resize', updateImages)
    }

    const api = {
        attach: elements => {
            isValidInstance()
            parseNode(elements).forEach(elem => {
                loadImage(elem, addImage)
            })
            return api
        },

        detach: elements => {
            isValidInstance()
            parseNode(elements).forEach(removeImage)
            return api
        },

        update: () => {
            isValidInstance()
            updateImages()
            return api
        },

        destroy: () => {
            if (!spec.accurate) {
                viewport.off('resize', updateImages)
            }
            document.head.removeChild(injected)
            images.forEach(image => {
                deleteImage(image, spec)
            })
            images = null
            injected = null
            return null
        }
    }

    return api
}

export default imgSize
