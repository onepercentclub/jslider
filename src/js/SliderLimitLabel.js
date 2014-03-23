var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SliderLimitLabel = (function (_super) {
    __extends(SliderLimitLabel, _super);
    function SliderLimitLabel(template, params) {
        _super.call(this);
        this.template = new SliderTemplate('<div class="<%=className%>-value"><span></span><%=dimension%></div>');
        this.template = new SliderTemplate(template);
        this.create(params);
    }
    SliderLimitLabel.prototype.fadeIn = function (duration) {
        return this.$el.fadeIn(duration);
    };

    SliderLimitLabel.prototype.fadeOut = function (duration) {
        return this.$el.fadeOut(duration);
    };
    return SliderLimitLabel;
})(SliderUXComponent);
