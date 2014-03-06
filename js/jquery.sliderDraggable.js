
var SliderDraggable = (function () {
    function SliderDraggable(pointer, uid, slider) {
        this.defaultIs = {
            drag: false,
            clicked: false,
            toclick: true,
            mouseup: false
        };
        this.init(pointer);
        this.onInit(pointer, uid, slider);
    }
    SliderDraggable.prototype.init = function (pointer) {
        if (arguments.length > 0) {
            this.pointer = $(pointer);
            this.outer = $('.draggable-outer');
        }

        var offset = this.getPointerOffset();

        this.is = $.extend(this.is, this.defaultIs);

        this.d = {
            left: offset.left,
            top: offset.top,
            width: this.pointer.width(),
            height: this.pointer.height()
        };

        this.events = {
            down: 'touch',
            move: 'drag',
            up: 'release',
            click: 'tap'
        };

        this.setupEvents();
    };

    SliderDraggable.prototype.setupEvents = function () {
        var _this = this;
        this.bind($(document), SliderDraggable.EVENT_MOVE, function (event) {
            if (_this.is.drag) {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();

                _this.mouseMove(event);
            }
        });

        this.bind($(document), SliderDraggable.EVENT_DOWN, function (event) {
            if (_this.is.drag) {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();
            }
        });

        this.bind(this.pointer, SliderDraggable.EVENT_MOVE, function (event) {
            if (_this.is.drag) {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();

                _this.mouseMove(event);
            }
        });

        this.bind(this.pointer, SliderDraggable.EVENT_DOWN, function (event) {
            _this.mouseDown(event);
            return false;
        });

        this.bind(this.pointer, SliderDraggable.EVENT_UP, function (event) {
            _this.mouseUp(event);
        });

        this.bind(this.pointer, SliderDraggable.EVENT_CLICK, function () {
            _this.is.clicked = true;

            if (!_this.is.toclick) {
                _this.is.toclick = true;
                return false;
            }

            return true;
        });
    };

    SliderDraggable.prototype.getPageCoords = function (event) {
        var touchList = event.gesture.touches;
        return {
            x: touchList[0].pageX,
            y: touchList[0].pageY
        };
    };

    SliderDraggable.prototype.getPointerOffset = function () {
        return this.pointer.offset();
    };

    SliderDraggable.prototype.unbind = function () {
        for (var eventType in this.events) {
            var namespacedEvent = this.events[eventType];
            $(document).hammer().off(namespacedEvent);
            this.pointer.hammer().off(namespacedEvent);
        }
    };

    SliderDraggable.prototype.bind = function (element, eventType, callback) {
        var namespacedEvent = this.events[eventType];
        console.log('binding namespaced event: %s', namespacedEvent);
        Hammer(element.get(0)).on(namespacedEvent, callback);
    };

    SliderDraggable.prototype.mouseDown = function (event) {
        this.is.drag = true;
        this.is.mouseup = this.is.clicked = false;

        var offset = this.getPointerOffset(), coords = this.getPageCoords(event);

        this.cursorX = coords.x - offset.left;
        this.cursorY = coords.y - offset.top;

        this.d = $.extend(this.d, {
            left: offset.left,
            top: offset.top,
            width: this.pointer.width(),
            height: this.pointer.height()
        });

        if (this.outer.length > 0) {
            this.outer.css({
                height: Math.max(this.outer.height(), $(document.body).height()),
                overflow: 'hidden'
            });
        }

        this.onMouseDown(event);
    };

    SliderDraggable.prototype.mouseMove = function (event) {
        this.is.toclick = false;
        var coords = this.getPageCoords(event);
        this.onMouseMove(event, coords.x - this.cursorX, coords.y - this.cursorY);
    };

    SliderDraggable.prototype.mouseUp = function (event) {
        if (!this.is.drag) {
            return;
        }

        this.is.drag = false;

        if (this.outer.length > 0 && (navigator.userAgent.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/i.test(navigator.userAgent))) {
            this.outer.css({ overflow: 'hidden' });
        } else {
            this.outer.css({ overflow: 'visible' });
        }

        this.onMouseUp(event);
    };

    SliderDraggable.prototype.onInit = function (pointer, id, constructor) {
    };

    SliderDraggable.prototype.onMouseDown = function (event) {
        this.pointer.css({ position: 'absolute' });
    };

    SliderDraggable.prototype.onMouseMove = function (event, x, y) {
        if (typeof x === "undefined") { x = null; }
        if (typeof y === "undefined") { y = null; }
    };

    SliderDraggable.prototype.onMouseUp = function (event) {
    };

    SliderDraggable.prototype.destroy = function () {
        this.unbind();
        this.pointer.remove();
    };
    SliderDraggable.EVENT_NAMESPACE = '.sliderDraggable';
    SliderDraggable.EVENT_CLICK = 'click';
    SliderDraggable.EVENT_UP = 'up';
    SliderDraggable.EVENT_MOVE = 'move';
    SliderDraggable.EVENT_DOWN = 'down';
    return SliderDraggable;
})();
