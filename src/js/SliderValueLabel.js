var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SliderValueLabel = (function (_super) {
    __extends(SliderValueLabel, _super);
    function SliderValueLabel(template, params) {
        _super.call(this);

        this.template = new SliderTemplate(template);
        this.create(params);
        this.$value = this.$el.find('span');
    }
    SliderValueLabel.prototype.setValue = function (str) {
        this.$value.html(str);
    };
    return SliderValueLabel;
})(SliderUXComponent);
