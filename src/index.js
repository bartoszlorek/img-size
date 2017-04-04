import addResize from './utils/eventResize.js';
import Image from './Image.js';

const images = [];
const onResize = addResize(() => {
    for (let i=0, len=images.length; i<len; i++) {
        images[i].resize();
    }
}, 50, 100);

function addImage(element, sizeType) {
    if (element && element.nodeType) {
        images.push(new Image(element, sizeType))
    }
}

module.exports = {
    add: function(element, sizeType) {
        if (element && element.length) {
            for (let i=0, len=element.length; i<len; i++)
               addImage(element[i], sizeType);
        } else addImage(element, sizeType);
        return this;
    },

    remove: function(element) {
        if (element && element.nodeType) {
            let index = images
                .map(img => img.image)
                .indexOf(element);
            if (index !== -1) {
                images.splice(index, 1);
            }
        }
        return this;
    },

    refresh: function() {
        for (let i=0, len=images.length; i<len; i++) {
            images[i].refresh();
        }
        return this;
    }
}