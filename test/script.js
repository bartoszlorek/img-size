;(function() {
    const size = imgSize({
        accurate: false
    })

    let images = document.querySelectorAll('img'),
        contain = document.getElementById('img-contain'),
        cover = document.getElementById('img-cover')

    size.attach(images)

    document.onkeydown = event => {
        switch (event.code) {
            case 'Enter':
                return size.attach(cover)
            case 'Space':
                return size.detach(cover)
            case 'Delete':
                return size.destroy()
        }
    }
})()
