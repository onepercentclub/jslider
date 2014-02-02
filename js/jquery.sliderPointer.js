/**
* Created by davidatborresen on 02.02.14.
*/
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../js/jquery.sliderDraggable.ts" />
/// <reference path="../js/jquery.slider.ts" />
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
    /**
    * @param pointer
    * @param id
    * @param slider
    */
    SliderPointer.prototype.onInit = function (pointer, id, slider) {
        _super.prototype.onInit.call(this, pointer, id, slider);

        this.uid = id;
        this.parent = slider;
        this.value = {};
        this.settings = this.parent.settings;
    };

    /**
    * @param event
    */
    SliderPointer.prototype.onMouseDown = function (event) {
        _super.prototype.onMouseDown.call(this, event);

        this._parent = {
            offset: this.parent.domNode.offset(),
            width: this.parent.domNode.width()
        };

        this.pointer.addDependClass('hover');

        this.setIndexOver();
    };

    /**
    * @param event
    */
    SliderPointer.prototype.onMouseMove = function (event) {
        _super.prototype.onMouseMove.call(this, event);

        this._set(this.calc(this.getPageCoords(event).x));
    };

    /**
    * @param event
    */
    SliderPointer.prototype.onMouseUp = function (event) {
        _super.prototype.onMouseUp.call(this, event);

        if (this.settings.callback && $.isFunction(this.settings.callback)) {
            this.settings.callback.call(this.parent, this.parent.getValue());
        }

        this.pointer.removeDependClass('hover');
    };

    SliderPointer.prototype.setIndexOver = function () {
        this.parent.setPointerIndex(1);
        this.index(2);
    };

    /**
    * @param i
    */
    SliderPointer.prototype.index = function (i) {
        this.pointer.css({ zIndex: i });
    };

    /**
    * @param x
    * @returns {number}
    */
    SliderPointer.prototype.limits = function (x) {
        return this.parent.limits(x, this);
    };

    /**
    * @param coords
    * @returns {number}
    */
    SliderPointer.prototype.calc = function (coords) {
        return this.limits(((coords - this._parent.offset.left) * 100) / this._parent.width);
    };

    /**
    * @param value
    * @param optOrigin
    */
    SliderPointer.prototype.set = function (value, optOrigin) {
        if (typeof optOrigin === "undefined") { optOrigin = false; }
        this.value.origin = this.parent.round(value);

        this._set(this.parent.valueToPrc(value, this), optOrigin);
    };

    /**
    * @param prc
    * @param optOrigin
    * @private
    */
    SliderPointer.prototype._set = function (prc, optOrigin) {
        if (typeof optOrigin === "undefined") { optOrigin = false; }
        if (this.settings.minDistance && this.parent.shouldPreventPositionUpdate(this)) {
            if (this.uid === 0 && this.value.prc < prc) {
                return;
            } else if (this.uid === 1 && this.value.prc > prc) {
                return;
            }
        }

        if (!optOrigin) {
            this.value.origin = this.parent.prcToValue(prc);
        }

        this.value.prc = prc;
        this.pointer.css({ left: prc + '%' });
        this.parent.redraw(this);
    };
    return SliderPointer;
})(SliderDraggable);
//# sourceMappingURL=jquery.sliderPointer.js.map
