;(function() {
    const size = imgSize()

    let imgs = document.getElementsByClassName('img-size'),
        wide = document.getElementById('img-wide')

    size.attach(imgs)
    //setTimeout(() => size.detach(wide), 500)
})()
