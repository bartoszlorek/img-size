import loadImage from './utils/loadImage.js';

const HORIZONTAL = 'img-size-h';
const VERTICAL = 'img-size-v';
const COVER = 'img-size-cover';
const CONTAIN = 'img-size-contain';

const regex = new RegExp('\\s*('+ HORIZONTAL +'|'+ VERTICAL +')');
const sizeCover = sizeMethod(offset => offset.width > offset.height);
const sizeContain = sizeMethod(offset => offset.width < offset.height);

function edgeOffset(aspect, parent) {
    let parentWidth = parent.clientWidth,
        parentHeight = parent.clientHeight,
        boundWidth = parentHeight * aspect,
        boundHeight = parentWidth / aspect;
    return {
        width: parentWidth - boundWidth,
        height: parentHeight - boundHeight
    }
}

function sizeMethod(callback) {
    return function(aspect, parent) {
        let offset = edgeOffset(aspect, parent);
        return callback.call(null, offset)
            ? HORIZONTAL : VERTICAL;
    }
}

function sizeType(element) {
    return function(className) {
        return element.className.indexOf(className) > -1;
    }
}

function createImage(element) {
    let direction,
        aspect;

    const isSizeType = sizeType(element);

    function resize() {
         loadImage(element, (size) => {
            if (  size.height === 0) return;
            if (! aspect) aspect = size.width / size.height;

            let method = isSizeType(CONTAIN) ? sizeContain : sizeCover,
            newDirection = method(aspect, element.parentElement);
            if (newDirection === direction) {
                return;
            }
            direction = newDirection;
            element.className = element.className.replace(regex, '');
            element.className += ' ' + direction;
        })
    }

    resize();
    return {
        image: element,
        resize
    }
}

export default createImage;
