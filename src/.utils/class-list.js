function baseAddClass(element, className) {
    if (element.classList) {
        element.classList.add(className)
    } else if (!hasClass(element, className)) {
        element.className += ' ' + className
    }
}

function baseRemoveClass(element, className) {
    if (element.classList) {
        element.classList.remove(className)
    } else if (hasClass(element, className)) {
        let reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        element.className = element.className.replace(reg, ' ')
    }
}

export function hasClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className)
    } else {
        return !!(element.className.indexOf(className) > -1)
    }
}

export function addClass(element, className) {
    if (typeof className === 'string') {
        baseAddClass(element, className)
    } else {
        let index = -1
        const length = className.length || 0
        while (++index < length) {
            baseAddClass(element, className[index])
        }
    }
}

export function removeClass(element, className) {
    if (typeof className === 'string') {
        baseRemoveClass(element, className)
    } else {
        let index = -1
        const length = className.length || 0
        while (++index < length) {
            baseRemoveClass(element, className[index])
        }
    }
}
