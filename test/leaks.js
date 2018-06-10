;(function() {
    const size = imgSize()

    let cat = document.querySelector('#cat')

    setInterval(() => {
        let img = document.createElement('img')
        img.src = 'http://bartoszlorek.pl/run/cat/tall.jpg'

        cat.appendChild(img)
        size.attach(img)

        setTimeout(() => {
            size.detach(img)
            cat.removeChild(img)
            img = null
        }, 100)
    }, 200)
})()
