var SliderBaseLabel = (function () {
    function SliderBaseLabel($element) {
        this.$el = $element;
    }
    SliderBaseLabel.prototype.css = function (cssProps) {
        return this.$el.css(cssProps);
    };

    SliderBaseLabel.prototype.outerWidth = function () {
        return this.$el.outerWidth();
    };

    SliderBaseLabel.prototype.offset = function () {
        return this.$el.offset();
    };

    SliderBaseLabel.prototype.destroy = function () {
        this.$el.detach();
        this.$el.off();
        this.$el.remove();
    };
    return SliderBaseLabel;
})();
