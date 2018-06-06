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

function mapArguments(args, methods) {
    if (args != null) {
        return function () {
            return args.map(function (a) {
                return methods[a]();
            });
        };
    }
    return function () {
        return null;
    };
}

function createEvents(schema, methods) {
    var events = {};

    Object.keys(schema).forEach(function (name) {
        var cachedValues = [];
        var _schema$name = schema[name],
            type = _schema$name.type,
            args = _schema$name.args;

        var execArguments = mapArguments(args, methods);

        var self = {
            type: type,
            subscribers: [],
            publisher: function publisher(forceUpdate) {
                var length = self.subscribers.length;
                var values = execArguments();

                if (forceUpdate !== true && values !== null) {
                    var shouldUpdate = values.some(function (value, index) {
                        return cachedValues[index] !== value;
                    });
                    cachedValues = values;
                    if (!shouldUpdate) {
                        return false;
                    }
                }

                var index = -1;
                while (++index < length) {
                    self.subscribers[index].apply(null, values);
                }
            }
        };
        events[name] = self;
    });

    return events;
}

function createListener(addEventListener, removeEventListener) {

    var addPublisher = function addPublisher(_ref) {
        var type = _ref.type,
            publisher = _ref.publisher;

        type.forEach(function (name) {
            return addEventListener(name, publisher);
        });
    };

    var removePublisher = function removePublisher(_ref2) {
        var type = _ref2.type,
            publisher = _ref2.publisher;

        type.forEach(function (name) {
            return removeEventListener(name, publisher);
        });
    };

    return {
        add: function add(event, fn) {
            var index = event.subscribers.indexOf(fn);
            if (index === -1) {
                event.subscribers.push(fn);
                if (event.subscribers.length === 1) {
                    addPublisher(event);
                }
            }
        },

        remove: function remove(event, fn) {
            var index = event.subscribers.indexOf(fn);
            if (index > -1) {
                event.subscribers.splice(index, 1);
                if (!event.subscribers.length) {
                    removePublisher(event);
                }
            }
        },

        removeAll: function removeAll(event) {
            event.subscribers = [];
            removePublisher(event);
        }
    };
}

var EVENT_SCHEMA = {
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
    width: function width() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    },
    height: function height() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },
    scrollX: function scrollX() {
        return window.scrollX || window.pageXOffset;
    },
    scrollY: function scrollY() {
        return window.scrollY || window.pageYOffset;
    }
};

// Browser compatibility

function createViewport() {
    var view = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

    var events = createEvents(EVENT_SCHEMA, EVENT_METHODS);

    var getValidEvent = function getValidEvent(name) {
        if (!events[name]) {
            throw new Error('The \'' + name + '\' is not a valid event name.');
        }
        return events[name];
    };

    var listener = createListener(addEventListener.bind(null, view), removeEventListener.bind(null, view));

    var api = {
        on: function on(name, fn) {
            var event = getValidEvent(name);
            if (typeof fn === 'function') {
                listener.add(event, fn);
            }
            return api;
        },

        off: function off(name, fn) {
            if (name === undefined) {
                Object.keys(events).forEach(function (name) {
                    listener.removeAll(events[name]);
                });
            } else {
                var event = getValidEvent(name);
                if (typeof fn === 'function') {
                    listener.remove(event, fn);
                } else if (fn === undefined) {
                    listener.removeAll(event);
                }
            }
            return api;
        },

        trigger: function trigger(name) {
            getValidEvent(name).publisher(true);
            return api;
        }

        // add static methods to the API
    };Object.keys(EVENT_METHODS).forEach(function (name) {
        api[name] = EVENT_METHODS[name];
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
    var element = document.createElement('style');
    document.head.appendChild(element);

    insertRules(element.sheet, makeRules(spec));
    element.setAttribute(STYLE_ATTR, '');
    return element;
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var ResizeSensor_min = createCommonjsModule(function (module, exports) {
!function(a,b){"function"==typeof undefined&&undefined.amd?undefined([],function(){return a.returnExportsGlobal=b()}):module.exports=b();}(commonjsGlobal,function(){var a=function(){function a(){this.q=[],this.add=function(a){this.q.push(a);};var a,b;this.call=function(){for(a=0,b=this.q.length;b>a;a++)this.q[a].call();};}function b(a,b){return a.currentStyle?a.currentStyle[b]:window.getComputedStyle?window.getComputedStyle(a,null).getPropertyValue(b):a.style[b]}function c(c,e){if(c.resizedAttached){if(c.resizedAttached)return void c.resizedAttached.add(e)}else c.resizedAttached=new a,c.resizedAttached.add(e);c.resizeSensor=document.createElement("div"),c.resizeSensor.className="resize-sensor";var f="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden; opacity: 0;",g="position: absolute; left: 0; top: 0; transition: 0s;";c.resizeSensor.style.cssText=f,c.resizeSensor.innerHTML='<div class="resize-sensor-expand" style="'+f+'"><div style="'+g+'"></div></div><div class="resize-sensor-shrink" style="'+f+'"><div style="'+g+' width: 200%; height: 200%"></div></div>',c.appendChild(c.resizeSensor),"static"==b(c,"position")&&(c.style.position="relative");var h=c.resizeSensor.childNodes[0],i=h.childNodes[0],j=c.resizeSensor.childNodes[1],k=function(){i.style.width=1e5+"px",i.style.height=1e5+"px",h.scrollLeft=1e5,h.scrollTop=1e5,j.scrollLeft=1e5,j.scrollTop=1e5;};k();var l=!1,m=function(){c.resizedAttached&&(l&&(c.resizedAttached.call(),l=!1),d(m));};d(m);var n,o,p,q,r=function(){((p=c.offsetWidth)!=n||(q=c.offsetHeight)!=o)&&(l=!0,n=p,o=q),k();},s=function(a,b,c){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener(b,c);};s(h,"scroll",r),s(j,"scroll",r);}var d=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||function(a){return window.setTimeout(a,20)},e=function(a,b){var d=this,e=Object.prototype.toString.call(a),f=d._isCollectionTyped="[object Array]"===e||"[object NodeList]"===e||"[object HTMLCollection]"===e||"undefined"!=typeof jQuery&&a instanceof window.jQuery||"undefined"!=typeof Elements&&a instanceof window.Elements;if(d._element=a,f)for(var g=0,h=a.length;h>g;g++)c(a[g],b);else c(a,b);};return e.prototype.detach=function(){var a=this,b=a._isCollectionTyped,c=a._element;if(b)for(var d=0,f=c.length;f>d;d++)e.detach(c[d]);else e.detach(c);},e.detach=function(a){a.resizeSensor&&(a.removeChild(a.resizeSensor),delete a.resizeSensor,delete a.resizedAttached);},e}();return a});
});

function baseAddClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    } else if (!hasClass(element, className)) {
        element.className += ' ' + className;
    }
}

function baseRemoveClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    } else if (hasClass(element, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(reg, ' ');
    }
}

function hasClass(element, className) {
    if (element.classList) {
        return element.classList.contains(className);
    } else {
        return !!(element.className.indexOf(className) > -1);
    }
}

function addClass(element, className) {
    if (typeof className === 'string') {
        baseAddClass(element, className);
    } else {
        var index = -1;
        var length = className.length || 0;
        while (++index < length) {
            baseAddClass(element, className[index]);
        }
    }
}

function removeClass(element, className) {
    if (typeof className === 'string') {
        baseRemoveClass(element, className);
    } else {
        var index = -1;
        var length = className.length || 0;
        while (++index < length) {
            baseRemoveClass(element, className[index]);
        }
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
    return function (element) {
        return check(boundingOffset(element, element.parentElement));
    };
};

var typeCover = shouldFitHorizontal(function (offset) {
    return offset.width > offset.height;
});

var typeContain = shouldFitHorizontal(function (offset) {
    return offset.width < offset.height;
});

function updateImage(image, spec) {
    var element = image.element;
    var horizontal = spec.horizontal,
        vertical = spec.vertical,
        cover = spec.cover;


    var predicate = hasClass(element, cover) ? typeCover : typeContain,
        className = predicate(element) ? horizontal : vertical;

    if (!hasClass(element, className)) {
        removeClass(element, className !== horizontal ? horizontal : vertical);
        addClass(element, className);
    }
}

function createImage(element, spec) {
    var image = { element: element };

    if (spec.accurate) {
        image.handler = new ResizeSensor_min(element.parentElement, function () {
            updateImage(image, spec);
        });
    }
    addClass(element.parentElement, spec.container);
    updateImage(image, spec);
    return image;
}

function deleteImage(image, spec) {
    removeClass(image.element.parentElement, spec.container);
    removeClass(image.element, [spec.horizontal, spec.vertical]);

    image.element = null;
    if (spec.accurate) {
        image.handler.detach();
        image.handler = null;
    }
}

var defaults = {
    accurate: false,
    container: 'img-size-container',
    horizontal: 'img-size-h',
    vertical: 'img-size-v',
    contain: 'img-size-contain',
    cover: 'img-size-cover'
};

var viewport$1 = null;

function imgSize(options) {
    var spec = objectAssign({}, defaults, options);
    var injected = injectRules(spec);
    var images = [];

    var addImage = function addImage(element) {
        images.push(createImage(element, spec));
    };

    var removeImage = function removeImage(element) {
        images = images.filter(function (image) {
            if (image.element === element) {
                return deleteImage(image, spec);
            }
            return true;
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

    if (!spec.accurate) {
        if (viewport$1 === null) {
            viewport$1 = viewport();
        }
        viewport$1.on('resize', updateImages);
    }

    var api = {
        attach: function attach(elements) {
            isValidInstance();
            parseNode(elements).forEach(function (elem) {
                loadImage(elem, addImage);
            });
            return api;
        },

        detach: function detach(elements) {
            isValidInstance();
            parseNode(elements).forEach(removeImage);
            return api;
        },

        update: function update() {
            isValidInstance();
            updateImages();
            return api;
        },

        destroy: function destroy() {
            if (!spec.accurate) {
                viewport$1.off('resize', updateImages);
            }
            document.head.removeChild(injected);
            images.forEach(function (image) {
                deleteImage(image, spec);
            });
            images = null;
            injected = null;
            return null;
        }
    };

    return api;
}

module.exports = imgSize;
