import loadImage from './load-image.js';

function getDirection(element) {
    loadImage(element, (img) => {
        console.log(img, img.width, img.height)
    })
    return 'v';
}

function addSizeClass(element) {
    let dir = getDirection(element);


    console.log(dir)
}

let images = document.getElementsByClassName('img-size');
for (let i=0, length=images.length; i<length; i++) {
    addSizeClass(images[i]);
}