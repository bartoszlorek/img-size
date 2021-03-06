const STYLE_ATTR = 'data-img-size'

const IMAGE_RULES = `
    position: absolute;
    left: 50%; top: 50%;
    -webkit-transform: translate(-50%,-50%);
        -ms-transform: translate(-50%,-50%);
            transform: translate(-50%,-50%);`

const makeRules = spec => [
    `.${spec.container}{
        position: relative;
        overflow: hidden;
    }`,
    `.${spec.horizontal}{
        ${IMAGE_RULES}
        width: 100%;
        height: auto;
    }`,
    `.${spec.vertical}{
        ${IMAGE_RULES}
        width: auto;
        height: 100%;
    }`
]

function insertRules(sheet, rules) {
    rules.forEach((rule, index) => {
        sheet.insertRule(rule, index)
    })
}

function injectRules(spec) {
    const elem = document.createElement('style')
    document.head.appendChild(elem)

    insertRules(elem.sheet, makeRules(spec))
    elem.setAttribute(STYLE_ATTR, '')
    return elem
}

export default injectRules
