import addResize from './utils/eventResize.js';
import createImage from './image.js';

const images = [];
const onResize = addResize(() => {
    images.forEach(img => img.resize());
}, 50, 100);

function addImage(element) {
    if (element && element.nodeType) {
        images.push(createImage(element))
    }
}

module.exports = {
    add: function(element) {
        if (element && element.length) {
            Array.prototype.forEach.call(element,
                item => addImage(item));
        } else addImage(element);
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
    }
}