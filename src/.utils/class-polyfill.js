const classToArray = value => {
    return typeof value === 'string' ? value.split(/\s+/) : value || []
}

export function hasClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className)
    } else {
        return !!(element.className.indexOf(className) > -1)
    }
}

export function addClass(element, className) {
    let classes = classToArray(className)
    if (element.classList) {
        element.classList.add.apply(element.classList, classes)
    } else {
        let result = element.className
        for (let i = 0; i < classes.length; i++) {
            if (result.indexOf(classes[i]) < 0) {
                result += ' ' + classes[i]
            }
        }
        element.className = result
    }
}

export function removeClass(element, className) {
    let classes = classToArray(className)
    if (element.classList) {
        element.classList.remove.apply(element.classList, classes)
    } else {
        let current = classToArray(element.className),
            result = ''
        for (let i = 0; i < current.length; i++) {
            if (classes.indexOf(current[i]) < 0) {
                result += ' ' + current[i]
            }
        }
        element.className = result.substring(1)
    }
}
