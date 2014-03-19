var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SliderValueLabel = (function (_super) {
    __extends(SliderValueLabel, _super);
    function SliderValueLabel($element) {
        _super.call(this, $element);

        this.$value = $element.find('span');
    }
    SliderValueLabel.prototype.setValue = function (str) {
        this.$value.html(str);
    };
    return SliderValueLabel;
})(SliderBaseLabel);
