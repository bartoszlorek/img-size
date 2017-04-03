import loadImage from './loadImage.js';

const HORIZONTAL = 'img-size-h';
const VERTICAL = 'img-size-v';
const COVER = 'img-size-cover';
const CONTAIN = 'img-size-contain';
const regex = new RegExp('\\s*('+ HORIZONTAL +'|'+ VERTICAL +')');

function edgeOffset(imageRatio, parent) {
    let parentWidth = parent.clientWidth,
        parentHeight = parent.clientHeight,
        boundWidth = parentHeight * imageRatio,
        boundHeight = parentWidth / imageRatio;
    return {
        width: parentWidth - boundWidth,
        height: parentHeight - boundHeight
    }
}

function sizeCover(imageRatio, parent) {
    let offset = edgeOffset(imageRatio, parent);
    return offset.width > offset.height ? HORIZONTAL : VERTICAL;
}

function sizeContain(imageRatio, parent) {
    let offset = edgeOffset(imageRatio, parent);
    return offset.width < offset.height ? HORIZONTAL : VERTICAL;
}

function sizeType(image) {
    if (image.className.indexOf(CONTAIN) !== -1)
        return CONTAIN;
    return COVER;
}

export default function imageResize(image) {
    let imageRatio,
        direction;

    return function() {
        loadImage(image, (size) => {
            if (! imageRatio) {
                  imageRatio = size.height > 0
                ? size.width / size.height
                : 0;
            }
            let method = sizeType(image) === COVER ? sizeCover : sizeContain,
                newDirection = method(imageRatio, image.parentElement);
            if (newDirection === direction) {
                return;
            }
            direction = newDirection;
            image.className = image.className.replace(regex, '');
            image.className += ' ' + direction;
        })
    }
}