var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SliderDraggable = (function (_super) {
    __extends(SliderDraggable, _super);
    function SliderDraggable(uid, slider) {
        _super.call(this);
        this.defaultIs = {
            drag: false,
            clicked: false,
            toclick: true,
            mouseup: false
        };

        this.onInit(uid, slider);
    }
    SliderDraggable.prototype.setupEvents = function () {
        var _this = this;
        this.bind(jQuery(document), SliderDraggable.EVENT_MOVE, function (event) {
            if (_this.is.drag) {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();

                _this.mouseMove(event);
            }
        });

        this.bind(jQuery(document), SliderDraggable.EVENT_DOWN, function (event) {
            if (_this.is.drag) {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();
            }
        });

        this.bind(this.$el, SliderDraggable.EVENT_MOVE, function (event) {
            if (_this.is.drag) {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();

                _this.mouseMove(event);
            }
        });

        this.bind(this.$el, SliderDraggable.EVENT_DOWN, function (event) {
            _this.mouseDown(event);
            return false;
        });

        this.bind(this.$el, SliderDraggable.EVENT_UP, function (event) {
            _this.mouseUp(event);
        });

        this.bind(this.$el, SliderDraggable.EVENT_CLICK, function () {
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
        return this.$el.offset();
    };

    SliderDraggable.prototype.unbind = function () {
        for (var eventType in this.events) {
            var namespacedEvent = this.events[eventType];
            jQuery(document).hammer().off(namespacedEvent);
            this.$el.hammer().off(namespacedEvent);
        }
    };

    SliderDraggable.prototype.destroy = function () {
        this.unbind();
        _super.prototype.destroy.call(this);
    };

    SliderDraggable.prototype.bind = function (element, eventType, callback) {
        var namespacedEvent = this.events[eventType];

        Hammer(element.get(0)).on(namespacedEvent, callback);
    };

    SliderDraggable.prototype.mouseDown = function (event) {
        this.is.drag = true;
        this.is.mouseup = this.is.clicked = false;

        var offset = this.getPointerOffset(), coords = this.getPageCoords(event);

        this.cursorX = coords.x - offset.left;
        this.cursorY = coords.y - offset.top;

        this.d = jQuery.extend(this.d, {
            left: offset.left,
            top: offset.top,
            width: this.$el.width(),
            height: this.$el.height()
        });

        if (this.outer.length > 0) {
            this.outer.css({
                height: Math.max(this.outer.height(), jQuery(document.body).height()),
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

    SliderDraggable.prototype.onInit = function (id, constructor) {
        this.outer = jQuery('.draggable-outer');

        var offset = this.getPointerOffset();

        this.is = jQuery.extend(this.is, this.defaultIs);

        this.d = {
            left: offset.left,
            top: offset.top,
            width: this.$el.width(),
            height: this.$el.height()
        };

        this.events = {
            down: 'touch',
            move: 'drag',
            up: 'release',
            click: 'tap'
        };

        this.setupEvents();
    };

    SliderDraggable.prototype.onMouseDown = function (event) {
        this.css({ position: 'absolute' });
    };

    SliderDraggable.prototype.onMouseMove = function (event, x, y) {
        if (typeof x === "undefined") { x = null; }
        if (typeof y === "undefined") { y = null; }
    };

    SliderDraggable.prototype.onMouseUp = function (event) {
    };
    SliderDraggable.EVENT_NAMESPACE = '.sliderDraggable';
    SliderDraggable.EVENT_CLICK = 'click';
    SliderDraggable.EVENT_UP = 'up';
    SliderDraggable.EVENT_MOVE = 'move';
    SliderDraggable.EVENT_DOWN = 'down';
    return SliderDraggable;
})(SliderUXComponent);
