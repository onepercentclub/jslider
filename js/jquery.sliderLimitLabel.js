var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SliderLimitLabel = (function (_super) {
    __extends(SliderLimitLabel, _super);
    function SliderLimitLabel($element) {
        _super.call(this, $element);
    }
    SliderLimitLabel.prototype.fadeIn = function (duration) {
        return this.$el.fadeIn(duration);
    };

    SliderLimitLabel.prototype.fadeOut = function (duration) {
        return this.$el.fadeIn(duration);
    };
    return SliderLimitLabel;
})(SliderBaseLabel);
