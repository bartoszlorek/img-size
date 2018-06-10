'use strict';

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

function parseNode(node) {
    if (node == null) {
        return [];
    }
    if (node.length !== undefined) {
        return Array.prototype.slice.call(node);
    }
    return [node];
}

function loadImage(source, callback) {
    if (source == null || callback == null) {
        return;
    }
    if (source.complete) {
        callback(source, source.naturalWidth, source.naturalHeight);
    } else {
        var path = source.src || source;
        if (typeof path !== 'string') {
            return;
        }
        var image = new Image();
        image.onload = function () {
            callback(source, image.naturalWidth, image.naturalHeight);
        };
        image.src = path;
    }
}

function addEventListener(elem, event, fn) {
    if (elem == null) {
        return;
    }
    if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
    } else {
        elem.attachEvent('on' + event, function () {
            return fn.call(elem, window.event);
        });
    }
}

function removeEventListener(elem, event, fn) {
    if (elem == null) {
        return;
    }
    if (elem.removeEventListener) {
        elem.removeEventListener(event, fn);
    } else {
        elem.detachEvent('on' + event, fn);
    }
}

function dispatchEvent(elem, eventType) {
    if (elem == null) {
        return;
    }
    if (typeof Event === 'function') {
        elem.dispatchEvent(new Event(eventType));
    } else if (elem.document) {
        var event = elem.document.createEvent('UIEvents');
        event.initUIEvent(eventType, true, false, elem, 0);
        elem.dispatchEvent(event);
    }
}

function mapArguments(args, methods) {
    if (args != null) {
        return function (event) {
            var values = args.map(function (arg) {
                return methods[arg]();
            });
            values.unshift(event);
            return values;
        };
    }
    return function (event) {
        return [event];
    };
}

function isEqualArray(arrayA, arrayB, offset) {
    var lengthA = arrayA == null ? 0 : arrayA.length;
    var lengthB = arrayB == null ? 0 : arrayB.length;

    if (lengthA !== lengthB) {
        return false;
    }
    var index = offset !== undefined ? offset - 1 : -1;
    while (++index < lengthA) {
        if (arrayA[index] !== arrayB[index]) {
            return false;
        }
    }
    return true;
}

function Container(items, loaded, unloaded) {
    this.items = items != null ? items.slice() : [];
    this.loaded = loaded || null;
    this.unloaded = unloaded || null;
}

Container.prototype = {
    get length() {
        return this.items.length;
    },

    add: function add(item) {
        var index = this.items.indexOf(item);
        if (index === -1) {
            this.items.push(item);
            if (this.loaded && this.items.length === 1) {
                this.loaded(this);
            }
        }
    },

    remove: function remove(item) {
        var index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            if (this.unloaded && !this.items.length) {
                this.unloaded(this);
            }
        }
    },

    empty: function empty() {
        this.items = [];
        if (this.unloaded) {
            this.unloaded(this);
        }
    },

    forEach: function forEach(iteratee) {
        var index = -1;
        var length = this.items.length;
        while (++index < length) {
            if (iteratee(this.items[index], index, this.items) === false) {
                return;
            }
        }
    }
};

function createEvent(runtime) {

    var addEventPublisher = function addEventPublisher(_ref) {
        var type = _ref.type,
            publisher = _ref.publisher;

        type.forEach(function (name) {
            runtime.addEventListener(runtime.view, name, publisher);
        });
    };
    var removeEventPublisher = function removeEventPublisher(_ref2) {
        var type = _ref2.type,
            publisher = _ref2.publisher;

        type.forEach(function (name) {
            runtime.removeEventListener(runtime.view, name, publisher);
        });
    };

    return function (options, methods) {
        var cachedValues = [];

        var execArguments = mapArguments(options.args, methods);
        var self = {
            type: options.type,
            subscribers: new Container(null, function () {
                return addEventPublisher(self);
            }, function () {
                return removeEventPublisher(self);
            }),

            publisher: function publisher(event) {
                var values = execArguments(event),
                    result = void 0;

                if (values.length > 1) {
                    var shouldUpdate = !isEqualArray(cachedValues, values, 1);

                    cachedValues = values;
                    if (!shouldUpdate) {
                        return false;
                    }
                }
                self.subscribers.forEach(function (subscriber) {
                    result = subscriber.apply(null, values);
                });
                if (result !== undefined) {
                    event.returnValue = result;
                }
                return result;
            },

            clearCache: function clearCache() {
                cachedValues = [];
                return self;
            }
        };

        return self;
    };
}

function bindMethods(view, methods) {
    var result = {};
    Object.keys(methods).forEach(function (name) {
        result[name] = function () {
            return methods[name](view, view.document);
        };
    });
    return result;
}

var EVENT_OPTIONS = {
    load: {
        type: ['load']
    },
    unload: {
        type: ['beforeunload']
    },
    resize: {
        type: ['resize', 'scroll', 'orientationchange'],
        args: ['width', 'height']
    },
    scroll: {
        type: ['scroll'],
        args: ['scrollX', 'scrollY']
    }
};

var EVENT_METHODS = {
    width: function width(win, doc) {
        return win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
    },
    height: function height(win, doc) {
        return win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight;
    },
    scrollX: function scrollX(win, doc) {
        return win.scrollX || win.pageXOffset;
    },
    scrollY: function scrollY(win, doc) {
        return win.scrollY || win.pageYOffset;
    }
};

// Browser compatibility

function createViewport() {
    var view = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

    var methods = bindMethods(view, EVENT_METHODS);
    var events = {};

    var createEvent$$1 = createEvent({
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        view: view
    });
    Object.keys(EVENT_OPTIONS).forEach(function (name) {
        events[name] = createEvent$$1(EVENT_OPTIONS[name], methods);
    });

    var getValidEvent = function getValidEvent(name) {
        if (!events[name]) {
            throw new Error('\'' + name + '\' is not a valid event name');
        }
        return events[name];
    };

    var api = {
        on: function on(name, fn) {
            var event = getValidEvent(name);
            if (typeof fn === 'function') {
                event.subscribers.add(fn);
            }
            return api;
        },

        off: function off(name, fn) {
            if (name === undefined) {
                Object.keys(events).forEach(function (name) {
                    events[name].subscribers.empty();
                });
            } else {
                var event = getValidEvent(name);
                if (typeof fn === 'function') {
                    event.subscribers.remove(fn);
                } else if (fn === undefined) {
                    event.subscribers.empty();
                }
            }
            return api;
        },

        trigger: function trigger(name) {
            var event = getValidEvent(name).clearCache();
            dispatchEvent(view, event.type[0]);
            return api;
        }

        // add static methods to the API
    };Object.keys(methods).forEach(function (name) {
        api[name] = methods[name];
    });

    return api;
}

var viewport = createViewport;

var STYLE_ATTR = 'data-img-size';

var IMAGE_RULES = '\n    position: absolute;\n    left: 50%; top: 50%;\n    -webkit-transform: translate(-50%,-50%);\n        -ms-transform: translate(-50%,-50%);\n            transform: translate(-50%,-50%);';

var makeRules = function makeRules(spec) {
    return ['.' + spec.container + '{\n        position: relative;\n        overflow: hidden;\n    }', '.' + spec.horizontal + '{\n        ' + IMAGE_RULES + '\n        width: 100%;\n        height: auto;\n    }', '.' + spec.vertical + '{\n        ' + IMAGE_RULES + '\n        width: auto;\n        height: 100%;\n    }'];
};

function insertRules(sheet, rules) {
    rules.forEach(function (rule, index) {
        sheet.insertRule(rule, index);
    });
}

function injectRules(spec) {
    var elem = document.createElement('style');
    document.head.appendChild(elem);

    insertRules(elem.sheet, makeRules(spec));
    elem.setAttribute(STYLE_ATTR, '');
    return elem;
}

var classToArray = function classToArray(value) {
    return typeof value === 'string' ? value.split(/\s+/) : value || [];
};

function hasClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className);
    } else {
        return !!(element.className.indexOf(className) > -1);
    }
}

function addClass(element, className) {
    var classes = classToArray(className);
    if (element.classList) {
        element.classList.add.apply(element.classList, classes);
    } else {
        var result = element.className;
        for (var i = 0; i < classes.length; i++) {
            if (result.indexOf(classes[i]) < 0) {
                result += ' ' + classes[i];
            }
        }
        element.className = result;
    }
}

function removeClass(element, className) {
    var classes = classToArray(className);
    if (element.classList) {
        element.classList.remove.apply(element.classList, classes);
    } else {
        var current = classToArray(element.className),
            result = '';
        for (var i = 0; i < current.length; i++) {
            if (classes.indexOf(current[i]) < 0) {
                result += ' ' + current[i];
            }
        }
        element.className = result.substring(1);
    }
}

function boundingOffset(image, container) {
    var aspect = image.naturalWidth / image.naturalHeight,
        boundWidth = container.clientHeight * aspect,
        boundHeight = container.clientWidth / aspect;
    return {
        width: container.clientWidth - boundWidth,
        height: container.clientHeight - boundHeight
    };
}

var shouldFitHorizontal = function shouldFitHorizontal(check) {
    return function (elem) {
        return check(boundingOffset(elem, elem.parentElement));
    };
};

var typeCover = shouldFitHorizontal(function (offset) {
    return offset.width > offset.height;
});

var typeContain = shouldFitHorizontal(function (offset) {
    return offset.width < offset.height;
});

function updateImage(elem, spec) {
    var horizontal = spec.horizontal,
        vertical = spec.vertical,
        cover = spec.cover;


    var isHorizontal = (hasClass(elem, cover) ? typeCover : typeContain)(elem),
        className = isHorizontal ? horizontal : vertical;

    if (!hasClass(elem, className)) {
        removeClass(elem, isHorizontal ? vertical : horizontal);
        addClass(elem, className);
    }
}

function createImage(elem, spec) {
    addClass(elem.parentElement, spec.container);
    updateImage(elem, spec);
    return elem;
}

function deleteImage(elem, spec) {
    removeClass(elem.parentElement, spec.container);
    removeClass(elem, [spec.horizontal, spec.vertical]);
    return null;
}

var defaults = {
    container: 'img-size-container',
    horizontal: 'img-size-h',
    vertical: 'img-size-v',
    contain: 'img-size-contain',
    cover: 'img-size-cover'
};

var viewport$1 = viewport();

function imgSize(options) {
    var spec = objectAssign({}, defaults, options);
    var injected = injectRules(spec);
    var images = [];

    var addImage = function addImage(elem) {
        images.push(createImage(elem, spec));
    };

    var removeImage = function removeImage(elem) {
        images = images.filter(function (img) {
            return img === elem ? deleteImage(elem, spec) : true;
        });
    };

    var updateImages = function updateImages() {
        var index = -1;
        var length = images.length;
        while (++index < length) {
            updateImage(images[index], spec);
        }
    };

    var isValidInstance = function isValidInstance() {
        if (images === null) {
            throw new Error('This ImgSize instance has been destroyed, so no operations can be performed on it.');
        }
        return true;
    };

    viewport$1.on('resize', updateImages);

    var api = {
        attach: function attach(element) {
            isValidInstance();
            parseNode(element).forEach(function (elem) {
                loadImage(elem, addImage);
            });
            return api;
        },

        detach: function detach(element) {
            isValidInstance();
            parseNode(element).forEach(removeImage);
            return api;
        },

        update: function update() {
            isValidInstance();
            updateImages();
            return api;
        },

        destroy: function destroy() {
            viewport$1.off('resize', updateImages);
            document.head.removeChild(injected);
            images.forEach(function (image) {
                return deleteImage(image, spec);
            });
            images = null;
            injected = null;
            return null;
        }
    };

    return api;
}

module.exports = imgSize;
