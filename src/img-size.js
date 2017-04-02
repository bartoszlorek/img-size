import loadImage from './load-image.js';
import addResize from './resize.js';

const HORIZONTAL = 'img-size-h';
const VERTICAL = 'img-size-v';
const regex = new RegExp('\\s*('+ HORIZONTAL +'|'+ VERTICAL +')');

function imageResize(image) {
    let imageRatio,
        direction;

    return function() {
        loadImage(image, (size) => {
            if (! imageRatio) {
                  imageRatio = size.height > 0
                ? size.width / size.height
                : 0;
            }
            let parent = image.parentElement,
                parentWidth = parent.clientWidth,
                parentHeight = parent.clientHeight;

            let altImageWidth = parentHeight * imageRatio,
                altImageHeight = parentWidth / imageRatio,
                hFactor = parentWidth - altImageWidth,
                vFactor = parentHeight - altImageHeight;

            let newDirection = hFactor > vFactor ? HORIZONTAL : VERTICAL;
            if (newDirection === direction) return;
            
            direction = newDirection;
            image.className = image.className.replace(regex, '');
            image.className += ' ' + direction;
        })
    }
}

const bindedImages = (() => {
    let images = [];
    let onResize = addResize(() => {
        let length = images.length;
        for (let i=0; i<length; i++) {
            images[i].action();
        }
    }, 100);

    function addImage(element) {
        images.push({
            image: element,
            action: imageResize(element)
        })
    }
    return {
        add: function(element) {
            if (! element) return;
            if (element.nodeType) {
                addImage(element);
            }
            else if (element.length) {
                let length = element.length;
                for (let i=0; i<length; i++) {
                    addImage(element[i]);
                }
            }
            return this;
        },
        remove: function(element) {
            if (element && element.nodeType) {
                images = images.filter(item =>
                    item.image !== element)
            }
            return this;
        },
        call: function() {
            onResize();
            return this;
        },
        get items() {
            return images;
        }
    }
})();


let images = document.getElementsByClassName('img-size'),
    wide = document.getElementById('img-wide');

bindedImages.add(images).call();