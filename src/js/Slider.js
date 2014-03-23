var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Slider = (function (_super) {
    __extends(Slider, _super);
    function Slider(inputNode, settings) {
        if (typeof settings === "undefined") { settings = {}; }
        _super.call(this);
        this.defaultSettings = {
            from: 1,
            to: 10,
            step: 1,
            smooth: true,
            limits: true,
            round: 0,
            format: { format: "#,##0.##" },
            value: '5;7',
            dimension: null,
            hetrogeneity: null,
            distance: {
                min: null,
                max: null
            }
        };

        this.settings = jQuery.extend(this.defaultSettings, settings);

        this.$input = jQuery(inputNode).hide();

        if (this.$input.prop('tagName') !== 'INPUT') {
            throw "jquery.slider: Slider must only be applied to INPUT elements.";
        }

        this.settings.interval = this.settings.to - this.settings.from;
        this.settings.value = this.$input.val();

        if (this.settings.value === null || this.settings.value === undefined) {
            throw "jquery.slider: INPUT element does not have a value.";
        }

        if (this.settings.calculate && jQuery.isFunction(this.settings.calculate)) {
            this.calculate = this.settings.calculate;
        }

        this.components = {
            limits: [],
            pointers: []
        };

        this.create({
            className: Slider.CLASSNAME,
            settings: {
                from: this.calculate(this.settings.from),
                to: this.calculate(this.settings.to),
                dimension: this.settings.dimension
            },
            scale: this.generateScale()
        });
    }
    Slider.prototype.create = function (params) {
        var _this = this;
        this.template = new SliderTemplate('<span class="<%=className%>">' + '<div class="<%=className%>-bg">' + '<i class="l"></i><i class="f"></i><i class="r"></i>' + '<i class="v"></i>' + '</div>' + (this.settings.scale ? '<div class="<%=className%>-scale"><%=scale%></div>' : '') + '</span>');
        _super.prototype.create.call(this, params);

        this.$input.after(this.$el);

        this.drawScale();

        var values = this.settings.value.split(';');
        if (values.length == 1) {
            this.settings.single = true;
            this.$el.addDependClass('single');
        } else if (values.length > 2) {
            throw "Slider: Only two handles are supported";
        }

        if (!this.settings.limits) {
            this.$el.addDependClass('limitless');
        }

        if (this.settings.skin) {
            this.setSkin(this.settings.skin.toString());
        }

        this.sizes = {
            domWidth: this.$el.width(),
            domOffset: this.$el.offset()
        };

        this.components = {
            pointers: [],
            limits: []
        };

        values.forEach(function (value, uid) {
            var typedValue = parseInt(value, 10);

            var prev = Number(values[uid - 1]);

            if (isNaN(typedValue)) {
                return;
            }

            if (!isNaN(prev) && typedValue < prev) {
                typedValue = prev;
            }

            var pointer = new SliderPointer(uid, _this);

            typedValue = (typedValue < _this.settings.from) ? _this.settings.from : typedValue;
            typedValue = (typedValue > _this.settings.to) ? _this.settings.to : typedValue;

            pointer.set(typedValue, true);

            _this.components.pointers[uid] = pointer;
        });

        this.createLimitLabels();

        if (!this.settings.single) {
            this.$value = this.$el.find('.v');
        }

        jQuery.each(this.getPointers(), function (i, pointer) {
            if (!_this.settings.single) {
                _this.ensurePointerIndex(pointer);
            }

            _this.redrawLabels(pointer);
        });

        this.setValue();

        this.setValueElementPosition();

        this.redrawLimits();

        jQuery(window).resize(function () {
            _this.onResize();
        });

        return this;
    };

    Slider.prototype.createLimitLabels = function () {
        var template;
        var params;
        var limitLabel;

        template = '<div class="<%=className%>-label"><span><%=from%></span><%=dimension%></div>';
        params = {
            className: Slider.CLASSNAME,
            from: this.settings.from,
            dimension: this.settings.dimension
        };
        limitLabel = new SliderLimitLabel(template, params);

        this.$el.append(limitLabel.$el);
        this.components.limits.push(limitLabel);

        template = '<div class="<%=className%>-label <%=className%>-label-to"><span><%=to%></span><%=dimension%></div>';
        params = {
            className: Slider.CLASSNAME,
            to: this.settings.to,
            dimension: this.settings.dimension
        };
        limitLabel = new SliderLimitLabel(template, params);

        this.$el.append(limitLabel.$el);
        this.components.limits.push(limitLabel);
    };

    Slider.prototype.ensurePointerIndex = function (pointer) {
        var otherPointer = pointer.getAdjacentPointer();
        if (!pointer.hasSameOrigin(otherPointer)) {
            return;
        }

        if (pointer.uid == Slider.POINTER_FROM && pointer.get().origin == this.settings.from) {
            otherPointer.setIndexOver();
        } else if (pointer.uid == Slider.POINTER_TO && pointer.get().origin == this.settings.to) {
            otherPointer.setIndexOver();
        }
    };

    Slider.prototype.onStateChange = function (value) {
        if (jQuery.isFunction(this.settings.onStateChange)) {
            return this.settings.onStateChange.apply(this, value);
        }
        return true;
    };

    Slider.prototype.disableSlider = function () {
        this.$el.addClass('disabled');
    };

    Slider.prototype.enableSlider = function () {
        this.$el.removeClass('disabled');
    };

    Slider.prototype.update = function () {
        this.onResize();
        this.drawScale();
    };

    Slider.prototype.setSkin = function (skinName) {
        if (this.settings.skin) {
            this.$el.removeDependClass(this.settings.skin, '_');
        }

        this.$el.addDependClass(this.settings.skin = skinName, "_");
    };

    Slider.prototype.setPointerIndex = function (index) {
        jQuery.each(this.getPointers(), function (i, pointer) {
            pointer.index(index);
        });
    };

    Slider.prototype.getPointers = function () {
        return this.components.pointers;
    };

    Slider.prototype.getLimits = function () {
        return this.components.limits;
    };

    Slider.prototype.generateScale = function () {
        if (!this.settings.scale) {
            return '';
        }

        var str = '', scale = this.settings.scale, prc = Math.min(Math.max(0, Math.round((100 / (scale.length - 1)) * 10000) / 10000), 100);

        for (var i = 0; i < scale.length; i++) {
            str += '<span style="left: ' + i * prc + '%">' + (scale[i] != '|' ? '<ins>' + scale[i] + '</ins>' : '') + '</span>';
        }

        return str;
    };

    Slider.prototype.drawScale = function () {
        this.$el.find(Slider.SELECTOR + 'scale span ins').each(function () {
            jQuery(this).css({ marginLeft: -jQuery(this).outerWidth() / 2 });
        });
    };

    Slider.prototype.onResize = function () {
        var _this = this;
        this.sizes = {
            domWidth: this.$el.width(),
            domOffset: this.$el.offset()
        };

        jQuery.each(this.components.pointers, function (i, pointer) {
            _this.redraw(pointer);
        });
    };

    Slider.prototype.calcLimits = function (x, pointer) {
        if (!this.settings.smooth) {
            var step = this.settings.step * 100 / (this.settings.interval);
            x = Math.round(x / step) * step;
        }

        var another = pointer.getAdjacentPointer();
        if (another && pointer.uid && x < another.get().prc) {
            x = another.get().prc;
        }

        if (another && !pointer.uid && x > another.get().prc) {
            x = another.get().prc;
        }

        if (x < 0) {
            x = 0;
        }

        if (x > 100) {
            x = 100;
        }

        return Math.round(x * 10) / 10;
    };

    Slider.prototype.redraw = function (pointer) {
        if (!this.isInitialized()) {
            return;
        }

        this.setValue();

        this.setValueElementPosition();

        this.redrawLabels(pointer);
    };

    Slider.prototype.setValueElementPosition = function () {
        if (this.components.pointers.length == 1) {
            return;
        }

        var fromPercent = this.components.pointers[Slider.POINTER_FROM].get().prc;
        var toPercent = this.components.pointers[Slider.POINTER_TO].get().prc;

        this.$value.css({
            left: fromPercent + '%',
            width: (toPercent - fromPercent) + '%'
        });
    };

    Slider.prototype.redrawLabels = function (pointer) {
        var label = pointer.getLabel();

        label.setValue(this.calculate(pointer.get().origin));

        var prc = pointer.get().prc;
        var sizes = {
            label: label.outerWidth(),
            right: false,
            border: (prc * this.sizes.domWidth) / 100
        };

        if (!this.settings.single && pointer.getAdjacentPointer()) {
            var otherPointer = pointer.getAdjacentPointer();
            var otherLabel = otherPointer.getLabel();

            switch (pointer.uid) {
                case Slider.POINTER_FROM:
                    if (sizes.border + sizes.label / 2 > (otherLabel.offset().left - this.sizes.domOffset.left)) {
                        otherLabel.css({ visibility: "hidden" });
                        otherLabel.setValue(this.calculate(otherPointer.get().origin));

                        label.css({ visibility: "visible" });

                        prc = (otherPointer.get().prc - prc) / 2 + prc;

                        if (otherPointer.get().prc != pointer.get().prc) {
                            label.setValue(this.calculate(pointer.get().origin) + '&nbsp;&ndash;&nbsp;' + this.calculate(otherPointer.get().origin));

                            sizes.label = label.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    } else {
                        otherLabel.css({ visibility: 'visible' });
                    }
                    break;

                case Slider.POINTER_TO:
                    if (sizes.border - sizes.label / 2 < (otherLabel.offset().left - this.sizes.domOffset.left) + otherLabel.outerWidth()) {
                        otherLabel.css({ visibility: 'hidden' });
                        otherLabel.setValue(this.calculate(otherPointer.get().origin));

                        label.css({ visibility: 'visible' });

                        prc = (prc - otherPointer.get().prc) / 2 + otherPointer.get().prc;

                        if (otherPointer.get().prc != pointer.get().prc) {
                            label.setValue(this.calculate(otherPointer.get().origin) + "&nbsp;&ndash;&nbsp;" + this.calculate(pointer.get().origin));

                            sizes.label = label.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    } else {
                        otherLabel.css({ visibility: 'visible' });
                    }
                    break;
            }
        }

        this.setPosition(label, sizes, prc);

        if (otherLabel) {
            sizes = {
                label: otherLabel.outerWidth(),
                right: false,
                border: (otherPointer.value.prc * this.sizes.domWidth) / 100
            };

            this.setPosition(otherLabel, sizes, otherPointer.value.prc);
        }
    };

    Slider.prototype.redrawLimits = function () {
        if (!this.settings.limits) {
            return;
        }

        var limits = [true, true];

        for (var key in this.components.pointers) {
            if (!this.settings.single || key == 0) {
                if (!this.components.pointers.hasOwnProperty(key)) {
                    continue;
                }

                var pointer = this.components.pointers[key];
                var label = pointer.getLabel();
                var labelLeft = label.offset().left - this.sizes.domOffset.left;

                if (labelLeft < this.components.limits[Slider.POINTER_FROM].outerWidth()) {
                    limits[0] = false;
                }

                if (labelLeft + label.outerWidth() > this.sizes.domWidth - this.components.limits[Slider.POINTER_TO].outerWidth()) {
                    limits[1] = false;
                }
            }
        }

        for (var i = 0; i < limits.length; i++) {
            if (!(this.components.limits[i] instanceof SliderLimitLabel)) {
                continue;
            }

            if (limits[i]) {
                this.components.limits[i].fadeIn('fast');
            } else {
                this.components.limits[i].fadeOut('fast');
            }
        }
    };

    Slider.prototype.setPosition = function (label, sizes, prc) {
        sizes.margin = -sizes.label / 2;

        var labelLeft = sizes.border + sizes.margin;
        if (labelLeft < 0) {
            sizes.margin -= labelLeft;
        }

        if (sizes.border + sizes.label / 2 > this.sizes.domWidth) {
            sizes.margin = 0;
            sizes.right = true;
        } else {
            sizes.right = false;
        }

        var cssProps = {
            left: prc + '%',
            marginLeft: sizes.margin,
            right: 'auto'
        };

        label.css(cssProps);

        if (sizes.right) {
            label.css({ left: "auto", right: 0 });
        }

        return sizes;
    };

    Slider.prototype.setValue = function () {
        var value = this.getValue();

        this.$input.val(value);

        this.onStateChange(value);
    };

    Slider.prototype.getValue = function () {
        var _this = this;
        if (!this.isInitialized()) {
            return false;
        }

        var value = '';
        jQuery.each(this.getPointers(), function (i, pointer) {
            if (pointer.get().prc != undefined && !isNaN(pointer.get().prc)) {
                value += (i > 0 ? ';' : '') + _this.prcToValue(pointer.get().prc);
            }
        });

        return value;
    };

    Slider.prototype.getPrcValue = function () {
        if (!this.isInitialized()) {
            return false;
        }

        var value = '';
        jQuery.each(this.getPointers(), function (i, pointer) {
            if (pointer.get().prc != undefined && !isNaN(pointer.get().prc)) {
                value += (i > 0 ? ';' : '') + pointer.get().prc;
            }
        });

        return value;
    };

    Slider.prototype.prcToValue = function (prc) {
        if (this.settings.hetrogeneity && this.settings.hetrogeneity.length > 0) {
            var heterogeneity = this.settings.hetrogeneity;
            var start = 0;
            var from = this.settings.from;
            var value;

            for (var i = 0; i <= heterogeneity.length; i++) {
                var v;
                if (heterogeneity[i]) {
                    v = heterogeneity[i].split('/');
                } else {
                    v = [100, this.settings.to];
                }

                v[0] = Number(v[0]);
                v[1] = Number(v[1]);

                if (prc >= start && prc <= v[0]) {
                    value = from + ((prc - start) * (v[1] - from)) / (v[0] - start);
                }

                start = v[0];
                from = v[1];
            }
        } else {
            value = this.settings.from + (prc * this.settings.interval) / 100;
        }

        return this.round(value);
    };

    Slider.prototype.valueToPrc = function (value, pointer) {
        var prc;
        if (this.settings.hetrogeneity && this.settings.hetrogeneity.length > 0) {
            var hetrogeneity = this.settings.hetrogeneity;
            var start = 0;
            var from = this.settings.from;
            var v;

            for (var i = 0; i <= hetrogeneity.length; i++) {
                if (hetrogeneity[i]) {
                    v = hetrogeneity[i].split('/');
                } else {
                    v = [100, this.settings.to];
                }

                v[0] = Number(v[0]);
                v[1] = Number(v[1]);

                if (value >= from && value <= v[1]) {
                    prc = pointer.calcLimits(start + (value - from) * (v[0] - start) / (v[1] - from));
                }

                start = v[0];
                from = v[1];
            }
        } else {
            prc = pointer.calcLimits((value - this.settings.from) * 100 / this.settings.interval);
        }

        return prc;
    };

    Slider.prototype.round = function (value) {
        value = Math.round(value / this.settings.step) * this.settings.step;

        if (this.settings.round) {
            value = Math.round(value * Math.pow(10, this.settings.round)) / Math.pow(10, this.settings.round);
        } else {
            value = Math.round(value);
        }

        return value;
    };

    Slider.prototype.calculate = function (value) {
        value = value.toString().replace(/,/gi, ".").replace(/ /gi, "");

        if (jQuery.formatNumber) {
            return jQuery.formatNumber(Number(value), this.settings.format || {}).replace(/-/gi, "&minus;");
        }

        return Number(value).toString();
    };

    Slider.prototype.destroy = function () {
        jQuery.each(this.components.pointers, function (i, sliderPointer) {
            sliderPointer.destroy();
        });

        jQuery.each(this.components.labels, function (i, sliderValueLabel) {
            sliderValueLabel.destroy();
        });

        jQuery.each(this.components.limits, function (i, sliderLimitLabel) {
            sliderLimitLabel.destroy();
        });

        this.$value.remove();

        this.$el.remove();
    };
    Slider.POINTER_FROM = 0;
    Slider.POINTER_TO = 1;
    Slider.CLASSNAME = 'jslider';
    Slider.SELECTOR = '.jslider-';
    return Slider;
})(SliderUXComponent);
