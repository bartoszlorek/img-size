import objectAssign from 'object-assign'
import parseNode from './.utils/parse-node'
import loadImage from './.utils/load-image'
import createViewport from './.utils/viewport'

import injectRules from './inject-rules'
import createImage from './create-image'
import deleteImage from './delete-image'
import updateImage from './update-image'

const defaults = {
    container: 'img-size-container',
    horizontal: 'img-size-h',
    vertical: 'img-size-v',
    contain: 'img-size-contain',
    cover: 'img-size-cover'
}

const viewport = createViewport()

function imgSize(options) {
    const spec = objectAssign({}, defaults, options)
    let injected = injectRules(spec)
    let images = []

    const addImage = elem => {
        images.push(createImage(elem, spec))
    }

    const removeImage = elem => {
        images = images.filter(img => {
            return img === elem ? deleteImage(elem, spec) : true
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
            throw new Error(
                'This ImgSize instance has been destroyed, so no operations can be performed on it.'
            )
        }
        return true
    }

    viewport.on('resize', updateImages)

    const api = {
        attach: element => {
            isValidInstance()
            parseNode(element).forEach(elem => {
                loadImage(elem, addImage)
            })
            return api
        },

        detach: element => {
            isValidInstance()
            parseNode(element).forEach(removeImage)
            return api
        },

        update: () => {
            isValidInstance()
            updateImages()
            return api
        },

        destroy: () => {
            viewport.off('resize', updateImages)
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
