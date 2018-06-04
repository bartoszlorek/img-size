import ResizeSensor from 'resize-sensor'
import objectAssign from 'object-assign'
import parseNode from './.utils/parse-node'
import loadImage from './.utils/load-image'
import calcSize from './calc-size'

const defaults = {
    horizontal: 'img-size-h',
    vertical: 'img-size-v',
    contain: 'img-size-contain',
    cover: 'img-size-cover'
}

function imgSize(options) {
    const spec = objectAssign({}, defaults, options)
    const images = []

    const addImage = element => {
        let image = {
            element,
            handler: new ResizeSensor(
                element.parentNode,
                () => calcSize(image, spec)
            )
        }
        images.push(image)
    }

    const removeImage = element => {
        let index = images.length
        while (index--) {
            let image = images[index]
            if (image.element === element) {
                image.handler.detach()
                image.handler = null
                image.element = null
                images.splice(index, 1)
                return
            }
        }
    }

    const api = {
        attach: elements => {
            parseNode(elements).forEach(elem => {
                loadImage(elem, addImage)
            })
            return api
        },
        detach: elements => {
            parseNode(elements).forEach(removeImage)
            return api
        }
    }

    return api
}

export default imgSize
