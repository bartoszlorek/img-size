'use strict';

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

module.exports = createViewport;
