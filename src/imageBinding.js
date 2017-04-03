import addResize from './eventResize.js';
import imageResize from './imageResize.js';

const images = [];
const onResize = addResize(() => {
    let length = images.length;
    for (let i=0; i<length; i++) {
        images[i].action();
    }
}, 100, 100);

function addImage(element) {
    if (element && element.nodeType) {
        images.push({
            image: element,
            action: imageResize(element)
        })
    }
}

module.exports = {
    add: function(element) {
        if (element && element.length) {
            let length = element.length;
            for (let i=0; i<length; i++)
                addImage(element[i]);
        } else  addImage(element);
        return this;
    },

    remove: function(element) {
        if (element && element.nodeType) {
            let length = images.length,
                index = -1;

            for (let i=0; i<length; i++) {
                if (images[i].image === element) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                images.splice(index, 1);
            }
        }
        return this;
    },

    call: function() {
        onResize();
        return this;
    }
}