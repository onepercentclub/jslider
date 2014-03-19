var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var SliderPointer = (function (_super) {
    __extends(SliderPointer, _super);
    function SliderPointer() {
        _super.apply(this, arguments);
    }
    SliderPointer.prototype.onInit = function (pointer, id, slider) {
        _super.prototype.onInit.call(this, pointer, id, slider);

        this.uid = id;
        this.parent = slider;
        this.value = {
            prc: null,
            origin: null
        };
        this.settings = this.parent.settings;
    };

    SliderPointer.prototype.onMouseDown = function (event) {
        _super.prototype.onMouseDown.call(this, event);

        this._parent = {
            offset: this.parent.$el.offset(),
            width: this.parent.$el.width()
        };

        this.pointer.addDependClass('hover');

        this.setIndexOver();
    };

    SliderPointer.prototype.onMouseMove = function (event) {
        _super.prototype.onMouseMove.call(this, event);

        this._set(this.calc(this.getPageCoords(event).x));

        this.parent.setValueElementPosition();

        this.parent.redrawLabels(this);
    };

    SliderPointer.prototype.isDistanceViolation = function () {
        var distance = this.settings.distance;
        var another = this.getAdjacentPointer();

        return (!this.settings.single && this.value && another && another.value) && (distance.min && ((this.uid === Slider.POINTER_FROM && this.value.origin + distance.min >= another.value.origin) || (this.uid === Slider.POINTER_TO && this.value.origin - distance.min <= another.value.origin)) || distance.max && ((this.uid === Slider.POINTER_FROM && another.value.origin + distance.max >= this.value.origin) || (this.uid === Slider.POINTER_TO && another.value.origin - distance.max <= this.value.origin)));
    };

    SliderPointer.prototype.onMouseUp = function (event) {
        _super.prototype.onMouseUp.call(this, event);

        if (!this.settings.single && this.isDistanceViolation()) {
            this.parent.setValueElementPosition();
        }

        if (jQuery.isFunction(this.settings.onStateChange)) {
            this.settings.onStateChange.call(this.parent, this.parent.getValue());
        }

        this.pointer.removeDependClass('hover');
    };

    SliderPointer.prototype.setIndexOver = function () {
        this.parent.setPointerIndex(1);
        this.index(2);
    };

    SliderPointer.prototype.index = function (i) {
        this.pointer.css({ zIndex: i });
    };

    SliderPointer.prototype.limits = function (x) {
        return this.parent.limits(x, this);
    };

    SliderPointer.prototype.calc = function (coords) {
        return this.limits(((coords - this._parent.offset.left) * 100) / this._parent.width);
    };

    SliderPointer.prototype.set = function (value, optOrigin) {
        if (typeof optOrigin === "undefined") { optOrigin = false; }
        this.value.origin = this.parent.round(value);

        this._set(this.parent.valueToPrc(value, this), optOrigin);
    };

    SliderPointer.prototype.get = function () {
        return this.value;
    };

    SliderPointer.prototype._set = function (prc, optOrigin) {
        if (typeof optOrigin === "undefined") { optOrigin = false; }
        if (!optOrigin) {
            this.value.origin = this.parent.prcToValue(prc);
        }

        var another = this.getAdjacentPointer(), distance = this.settings.distance;

        if (this.isDistanceViolation()) {
            var originValue = this.get().origin;
            var anotherOriginValue = another.get().origin;

            switch (this.uid) {
                case Slider.POINTER_FROM:
                    if (Boolean(distance.max) && originValue <= (anotherOriginValue - distance.max)) {
                        this.value.origin = anotherOriginValue - distance.max;
                    } else if (Boolean(distance.min) && (originValue + distance.min) >= anotherOriginValue) {
                        this.value.origin = this.clamp(anotherOriginValue - distance.min, this.settings.from, this.settings.to);
                    }

                    break;

                case Slider.POINTER_TO:
                    if (Boolean(distance.max) && originValue >= (anotherOriginValue + distance.max)) {
                        this.value.origin = anotherOriginValue + distance.max;
                    } else if (Boolean(distance.min) && (originValue - distance.min) <= anotherOriginValue) {
                        this.value.origin = this.clamp(anotherOriginValue + distance.min, this.settings.from, this.settings.to);
                    }

                    break;
            }

            prc = this.parent.valueToPrc(this.value.origin, this);
        }

        this.value.prc = prc;
        this.pointer.css({ left: prc + '%' });
        this.parent.update();
    };

    SliderPointer.prototype.clamp = function (delta, min, max) {
        if (delta > max) {
            return max;
        } else if (delta < min) {
            return min;
        }

        return delta;
    };

    SliderPointer.prototype.getAdjacentPointer = function () {
        return this.parent.getPointers()[1 - this.uid];
    };

    SliderPointer.prototype.hasSameOrigin = function (pointer) {
        return (this.value.prc == pointer.get().prc);
    };
    return SliderPointer;
})(SliderDraggable);
