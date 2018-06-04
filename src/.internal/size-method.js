import boundingOffset from './bounding-offset'

function sizeMethod(predicate) {
    return (element, horizontal, vertical) => {
        let offset = boundingOffset(element, element.parentElement)
        return predicate(offset, horizontal, vertical)
    }
}

export default sizeMethod
