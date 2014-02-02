/**
* Created by davidatborresen on 31.01.14.
*/
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="jquery.slider.ts" />

var SliderDraggable = (function () {
    function SliderDraggable() {
        this.defaultIs = {
            drag: false,
            clicked: false,
            toclick: true,
            mouseup: false
        };
        this.init.apply(this, arguments);
    }
    SliderDraggable.prototype.init = function () {
        if (arguments.length > 0) {
            this.pointer = $(arguments[0]);
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
            "click": this.supportTouches ? "touchstart" : "click",
            "down": this.supportTouches ? "touchstart" : "mousedown",
            "move": this.supportTouches ? "touchmove" : "mousemove",
            "up": this.supportTouches ? "touchend" : "mouseup"
        };

        this.onInit.apply(this, arguments);

        this.setupEvents();
    };

    SliderDraggable.prototype.setupEvents = function () {
        var _this = this;
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

        var $anchor = this.pointer.find('a');

        $anchor.on('click', function () {
            _this.is.clicked = true;

            if (!_this.is.toclick) {
                _this.is.toclick = true;
                return false;
            }

            return true;
        });

        $anchor.on('mousedown', function (event) {
            _this.mouseDown(event);
        });
    };

    /**
    * @param event
    * @returns {{x: number, y: number}}
    */
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

    /**
    * @returns {{left: number, top: number}}
    */
    SliderDraggable.prototype.getPointerOffset = function () {
        return this.pointer.offset();
    };

    /**
    * @param element
    * @param eventType
    * @param callback
    */
    SliderDraggable.prototype.bindEvent = function (element, eventType, callback) {
        if (this.supportTouches) {
            element.get(0).addEventListener(this.events[eventType], callback, false);
        } else {
            element.on(this.events[eventType], callback);
        }
    };

    /**
    * @param event {Event}
    */
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

    /**
    * @param event {MouseEvent}
    */
    SliderDraggable.prototype.mouseMove = function (event) {
        this.is.toclick = false;
        var coords = this.getPageCoords(event);
        this.onMouseMove(event, coords.x - this.cursorX, coords.y - this.cursorY);
    };

    /**
    * @param event {MouseEvent}
    */
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

    /**
    * @param pointer
    * @param id
    * @param constructor
    */
    SliderDraggable.prototype.onInit = function (pointer, id, constructor) {
    };

    /**
    * @param event {MouseEvent}
    */
    SliderDraggable.prototype.onMouseDown = function (event) {
        this.pointer.css({ position: "absolute" });
    };

    /**
    * @param event {MouseEvent}
    * @param x {number}
    * @param y {number}
    */
    SliderDraggable.prototype.onMouseMove = function (event, x, y) {
        if (typeof x === "undefined") { x = null; }
        if (typeof y === "undefined") { y = null; }
    };

    /**
    * @param event {MouseEvent}
    */
    SliderDraggable.prototype.onMouseUp = function (event) {
    };
    SliderDraggable.EVENT_UP = 'up';
    SliderDraggable.EVENT_MOVE = 'move';
    SliderDraggable.EVENT_DOWN = 'down';
    return SliderDraggable;
})();
//# sourceMappingURL=jquery.sliderDraggable.js.map
