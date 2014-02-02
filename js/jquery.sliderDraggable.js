
var SliderDraggable = (function () {
    function SliderDraggable() {
        this.defaultIs = {
            drag: false,
            clicked: false,
            toclick: true,
            mouseup: false
        };
        this.init();
    }
    SliderDraggable.prototype.init = function () {
        if (arguments.length > 0) {
            this.ptr = $(arguments[0]);
            this.outer = $('.draggable-outer');
        }

        var offset = this.getPointerOffset();

        this.is = $.extend(this.is, this.defaultIs);

        this.d = {
            left: offset.left,
            top: offset.top,
            width: this.ptr.width(),
            height: this.ptr.height()
        };

        this.supportTouches = ('ontouchend' in document);

        this.events = {
            "click": this.supportTouches ? "touchstart" : "click",
            "down": this.supportTouches ? "touchstart" : "mousedown",
            "move": this.supportTouches ? "touchmove" : "mousemove",
            "up": this.supportTouches ? "touchend" : "mouseup"
        };

        this.onInit(arguments);

        this.setupEvents();
    };

    SliderDraggable.prototype.setupEvents = function () {
        var _this = this;
        this.bindEvent($(document), SliderDraggable.EVENT_MOVE, function (event) {
            if (_this.is.drag) {
                event.preventDefault();
                event.stopPropagation();

                _this.onMouseMove(event);
            }
        });

        this.bindEvent($(document), SliderDraggable.EVENT_DOWN, function (event) {
            if (_this.is.drag) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        this.bindEvent($(document), SliderDraggable.EVENT_UP, this.onMouseUp);

        this.bindEvent(this.ptr, SliderDraggable.EVENT_DOWN, function (event) {
            _this.onMouseDown(event);
        });

        this.bindEvent(this.ptr, SliderDraggable.EVENT_UP, function (event) {
            _this.onMouseUp(event);
        });

        this.ptr.find('a').click(function () {
            _this.is.clicked = true;

            if (!_this.is.toclick) {
                _this.is.toclick = true;
                return false;
            }

            return true;
        }).mousedown(function (event) {
            _this.mouseDown(event);
            return false;
        });
    };

    SliderDraggable.prototype.getPageCoords = function (event) {
        if (event.targetTouches && event.targetTouches[0]) {
            return {
                x: event.targetTouches[0].pageX,
                y: event.targetTouches[0].pageY
            };
        } else {
            return {
                x: event.pageX,
                y: event.pageY
            };
        }
    };

    SliderDraggable.prototype.getPointerOffset = function () {
        return this.ptr.offset();
    };

    SliderDraggable.prototype.bindEvent = function (ptr, eventType, callback) {
        if (this.supportTouches) {
            ptr.get(0).addEventListener(this.events[eventType], callback, false);
        } else {
            ptr.on(this.events[eventType], callback);
        }
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
            width: this.ptr.width(),
            height: this.ptr.height()
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

        if (this.outer.length > 0 && (navigator.userAgent.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/i.test(navigator.userAgent))) {
            this.outer.css({ overflow: 'hidden' });
        } else {
            this.outer.css({ overflow: 'visible' });
        }

        this.onMouseUp(event);
    };

    SliderDraggable.prototype.onInit = function (pointer, id, constructor) {
    };

    SliderDraggable.prototype.onMouseDown = function (event) {
        this.ptr.css({ position: "absolute" });
    };

    SliderDraggable.prototype.onMouseMove = function (event, x, y) {
        if (typeof x === "undefined") { x = null; }
        if (typeof y === "undefined") { y = null; }
    };

    SliderDraggable.prototype.onMouseUp = function (event) {
    };
    SliderDraggable.EVENT_UP = 'up';
    SliderDraggable.EVENT_MOVE = 'move';
    SliderDraggable.EVENT_DOWN = 'down';
    return SliderDraggable;
})();
