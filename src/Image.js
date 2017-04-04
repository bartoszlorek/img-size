import loadImage from './utils/loadImage.js';

const HORIZONTAL = 'img-size-h';
const VERTICAL = 'img-size-v';
const TYPES = {
    cover: 'img-size-cover',
    contain: 'img-size-contain'
}

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
    return offset.width > offset.height
        ? HORIZONTAL : VERTICAL;
}

function sizeContain(imageRatio, parent) {
    let offset = edgeOffset(imageRatio, parent);
    return offset.width < offset.height
        ? HORIZONTAL : VERTICAL;
}

function sizeTypeDefault(type) {
    return TYPES.hasOwnProperty(type)
        ? TYPES[type] : TYPES.cover;
}

function sizeTypeClass(className) {
    className = className.split(' ').reverse();
    for (let type in TYPES) {
        if (className.indexOf(TYPES[type]) > -1)
            return TYPES[type];
    } return false;
}

export default class Image {
    constructor(image, sizeType) {
        this.image = image;
        this.sizeType = sizeTypeDefault(sizeType);
        this.direction = null;
        this.refresh();
    }

    resize() {
        loadImage(this.image, (size) => {
            if (! this.imageRatio) {
                  this.imageRatio = size.height > 0
                ? size.width / size.height
                : 0;
            }
            let method = this.sizeType === TYPES.cover ? sizeCover : sizeContain,
                newDirection = method(this.imageRatio, this.image.parentElement);
            if (newDirection === this.direction) {
                return;
            }
            this.direction = newDirection;
            this.image.className = this.image.className.replace(regex, '');
            this.image.className += ' ' + this.direction;
        })
    }

    refresh() {
        let sizeType = sizeTypeClass(this.image.className);
        if (sizeType !== false) this.sizeType = sizeType;
        this.resize();
    }

}