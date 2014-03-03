
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

        this.supportTouches = ('ontouchend' in document);

        this.events = {
            'down': this.supportTouches ? 'touchstart MSPointerDown' : 'mousedown',
            'move': this.supportTouches ? 'touchmove MSPointerMove' : 'mousemove',
            'up': this.supportTouches ? 'touchend MSPointerUp' : 'mouseup',
            'click': this.supportTouches ? 'touchstart MSPointerDown' : 'click'
        };

        this.setupEvents();
    };

    SliderDraggable.prototype.setupEvents = function () {
        var _this = this;
        this.bindEvent($(document), SliderDraggable.EVENT_MOVE, function (event) {
            if (_this.is.drag) {
                event.preventDefault();
                event.stopImmediatePropagation();

                _this.mouseMove(event);
            }
        });

        this.bindEvent($(document), SliderDraggable.EVENT_DOWN, function (event) {
            if (_this.is.drag) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        this.bindEvent($(document), SliderDraggable.EVENT_UP, function (event) {
            _this.mouseUp(event);
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_MOVE, function (event) {
            if (_this.is.drag) {
                event.preventDefault();
                event.stopPropagation();

                _this.mouseMove(event);
            }
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_DOWN, function (event) {
            _this.mouseDown(event);
            return false;
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_UP, function (event) {
            _this.mouseUp(event);
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_CLICK, function (event) {
            _this.is.clicked = true;

            if (!_this.is.toclick) {
                _this.is.toclick = true;
                return false;
            }

            return true;
        });
    };

    SliderDraggable.prototype.getPageCoords = function (event) {
        var originalEvent = ('TouchEvent' in window && event.originalEvent instanceof TouchEvent) || ('MSGestureEvent' in window && event.originalEvent instanceof MSGestureEvent) ? event.originalEvent : event;

        if ('targetTouches' in originalEvent && originalEvent.targetTouches.length == 1) {
            return {
                x: originalEvent.targetTouches[0].pageX,
                y: originalEvent.targetTouches[0].pageY
            };
        }

        return {
            x: originalEvent.pageX,
            y: originalEvent.pageY
        };
    };

    SliderDraggable.prototype.getPointerOffset = function () {
        return this.pointer.offset();
    };

    SliderDraggable.prototype.unbindAllEvents = function () {
        for (var eventType in this.events) {
            $(document).off(this.events[eventType] + SliderDraggable.EVENT_NAMESPACE);
            this.pointer.off(this.events[eventType] + SliderDraggable.EVENT_NAMESPACE);
        }
    };

    SliderDraggable.prototype.bindEvent = function (element, eventType, callback) {
        Hammer(element).on(this.events[eventType] + SliderDraggable.EVENT_NAMESPACE, callback);
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
        this.unbindAllEvents();
        this.pointer.remove();
    };
    SliderDraggable.EVENT_NAMESPACE = '.slider.draggable';
    SliderDraggable.EVENT_CLICK = 'click';
    SliderDraggable.EVENT_UP = 'up';
    SliderDraggable.EVENT_MOVE = 'move';
    SliderDraggable.EVENT_DOWN = 'down';
    return SliderDraggable;
})();
