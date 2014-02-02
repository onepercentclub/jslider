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
    SliderPointer.prototype.onInit = function (pointer, id, constructor) {
        this.uid = id;
        this.parent = constructor;
        this.value = {};
        this.settings = this.parent.settings;
    };

    SliderPointer.prototype.onMouseDown = function () {
        this._parent = {
            offset: this.parent.domNode.offset(),
            width: this.parent.domNode.width()
        };

        this.pointer.addDependClass('hover');
        this.setIndexOver();
    };

    SliderPointer.prototype.onMouseMove = function (event) {
        var coords = this.getPageCoords(event);
        this.set(this.calc(coords.x));
    };

    SliderPointer.prototype.onMouseUp = function () {
        if (this.settings.callback && $.isFunction(this.settings.callback)) {
            this.settings.callback.call(this.parent, this.parent.getValue());
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
        if (typeof optOrigin === "undefined") { optOrigin = null; }
        this.value.origin = this.parent.round(value);

        var prc = this.parent.valueToPrc(value, this);

        if (!optOrigin) {
            this.value.origin = this.parent.prcToValue(prc);
        }

        this.value.prc = prc;
        this.pointer.css({ left: prc + '%' });
        this.parent.redraw(this);
    };
    return SliderPointer;
})(SliderDraggable);
