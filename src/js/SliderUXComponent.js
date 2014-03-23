var SliderUXComponent = (function () {
    function SliderUXComponent() {
        this.initialized = false;
    }
    SliderUXComponent.prototype.create = function (templateParams) {
        if (typeof templateParams === "undefined") { templateParams = {}; }
        if (!this.template) {
            throw 'No template is defined';
        }

        if (this.isInitialized()) {
            return this;
        }

        this.$el = jQuery(this.template.render(templateParams));

        this.initialized = true;

        return this;
    };

    SliderUXComponent.prototype.css = function (cssProps) {
        return this.$el.css(cssProps);
    };

    SliderUXComponent.prototype.outerWidth = function () {
        return this.$el.outerWidth();
    };

    SliderUXComponent.prototype.offset = function () {
        return this.$el.offset();
    };

    SliderUXComponent.prototype.destroy = function () {
        this.$el.detach();
        this.$el.off();
        this.$el.remove();
    };

    SliderUXComponent.prototype.isInitialized = function () {
        return this.initialized;
    };
    return SliderUXComponent;
})();
