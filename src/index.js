import objectAssign from 'object-assign'
import parseNode from './.utils/parse-node'
import loadImage from './.utils/load-image'

import injectRules from './inject-rules'
import createImage from './create-image'
import deleteImage from './delete-image'

const defaults = {
    container: 'img-size-container',
    horizontal: 'img-size-h',
    vertical: 'img-size-v',
    contain: 'img-size-contain',
    cover: 'img-size-cover'
}

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

    const isValidInstance = () => {
        if (images === null) {
            throw new Error('This ImgSize instance has been destroyed, so no operations can be performed on it.')
        }
        return true
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
        destroy: () => {
            document.head.removeChild(injected)
            images.forEach(image => deleteImage(image, spec))
            images = null
            injected = null
            return null
        }
    }

    return api
}

export default imgSize
