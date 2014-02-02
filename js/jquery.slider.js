
var Slider = (function () {
    function Slider() {
        this.defaultOptions = {
            settings: {
                from: 1,
                to: 10,
                step: 1,
                smooth: true,
                limits: true,
                round: 0,
                format: { format: "#,##0.##" },
                value: "5;7",
                dimension: ""
            },
            className: "jslider",
            selector: ".jslider-",
            template: tmpl('<span class="<%=className%>">' + '<table><tr><td>' + '<div class="<%=className%>-bg">' + '<i class="l"></i><i class="f"></i><i class="r"></i>' + '<i class="v"></i>' + '</div>' + '<div class="<%=className%>-pointer"></div>' + '<div class="<%=className%>-pointer <%=className%>-pointer-to"></div>' + '<div class="<%=className%>-label"><span><%=settings.from%></span></div>' + '<div class="<%=className%>-label <%=className%>-label-to"><span><%=settings.to%></span><%=settings.dimension%></div>' + '<div class="<%=className%>-value"><span></span><%=settings.dimension%></div>' + '<div class="<%=className%>-value <%=className%>-value-to"><span></span><%=settings.dimension%></div>' + '<div class="<%=className%>-scale"><%=scale%></div>' + '</td></tr></table>' + '</span>')
        };
        this.is = {
            init: false
        };
        this.o = {};
        this.init.apply(this, arguments);
    }
    Slider.prototype.init = function (node, settings) {
        this.settings = $.extend(true, {}, this.defaultOptions.settings, settings);

        this.inputNode = $(node).hide();

        if (this.inputNode.prop('tagName') !== 'INPUT') {
            throw "jquery.slider: Slider must only be applied to INPUT elements.";
        }

        this.settings.interval = this.settings.to - this.settings.from;
        this.settings.value = this.inputNode.val();

        if (this.settings.value === null || this.settings.value === undefined) {
            throw "jquery.slider: INPUT element does not have a value.";
        }

        if (this.settings.calculate && $.isFunction(this.settings.calculate)) {
            this.nice = this.settings.calculate;
        }

        this.create();
    };

    Slider.prototype.create = function () {
        var _this = this;
        this.domNode = $(this.defaultOptions.template({
            className: this.defaultOptions.className,
            settings: {
                from: this.nice(this.settings.from),
                to: this.nice(this.settings.to),
                dimension: this.settings.dimension
            },
            scale: this.generateScale()
        }));

        this.inputNode.after(this.domNode);

        this.drawScale();

        if (this.settings.skin && this.settings.skin.length > 0) {
            this.setSkin(this.settings.skin);
        }

        this.sizes = {
            domWidth: this.domNode.width(),
            domOffset: this.domNode.offset()
        };

        $.extend(this.o, {
            pointers: [],
            labels: [
                {
                    o: this.domNode.find(this.defaultOptions.selector + 'value').not(this.defaultOptions.selector + 'value-to')
                },
                {
                    o: this.domNode.find(this.defaultOptions.selector + 'value').not(this.defaultOptions.selector + 'value-to')
                }
            ],
            limits: [
                {
                    o: this.domNode.find(this.defaultOptions.selector + 'label').not(this.defaultOptions.selector + 'label-to')
                },
                {
                    o: this.domNode.find(this.defaultOptions.selector + 'label').not(this.defaultOptions.selector + 'label-to')
                }
            ]
        });

        $.extend(this.o.labels[0], {
            value: this.o.labels[0].o.find('span')
        });

        $.extend(this.o.labels[1], {
            value: this.o.labels[1].o.find('span')
        });

        if (!this.settings.value.split(';')[1]) {
            this.settings.single = true;
            this.domNode.addDependClass('single');
        }

        if (!this.settings.limits) {
            this.domNode.addDependClass('limitless');
        }

        var values = this.settings.value.split(';');
        this.domNode.find(this.defaultOptions.selector + 'pointer').each(function (i, element) {
            var value = Number(values[i]);

            if (value) {
                _this.o.pointers[i] = new SliderPointer(element, i, _this);
                var prev = Number(values[i - 1]);

                if (prev && value < prev) {
                    value = prev;
                }

                value = (value < _this.settings.from) ? _this.settings.from : value;
                value = (value > _this.settings.to) ? _this.settings.to : value;

                _this.o.pointers[i].set(value, true);
            }
        });

        this.o.value = this.domNode.find('.v');
        this.is.init = true;

        $.each(this.o.pointers, function (i, pointer) {
            _this.redraw(pointer);
        });

        $(window).resize(function () {
            _this.onResize();
        });
    };

    Slider.prototype.onStateChange = function (value) {
        if ($.isFunction(this.settings.onStateChange)) {
            return this.settings.onStateChange.apply(this, value);
        }
        return true;
    };

    Slider.prototype.disableSlider = function () {
        this.domNode.addClass('disabled');
    };

    Slider.prototype.enableSlider = function () {
        this.domNode.removeClass('disabled');
    };

    Slider.prototype.update = function () {
        this.onResize();
        this.drawScale();
    };

    Slider.prototype.setSkin = function (skinName) {
        if (this.skin) {
            this.domNode.removeDependClass(this.skin, '_');
        } else {
            this.domNode.addDependClass(this.skin = skinName, "_");
        }
    };

    Slider.prototype.setPointerIndex = function (index) {
        $.each(this.getPointers(), function (i, pointer) {
            pointer.index(index);
        });
    };

    Slider.prototype.getPointers = function () {
        return this.o.pointers;
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
        this.domNode.find(this.defaultOptions.selector + 'scale span ins').each(function () {
            $(this).css({ marginLeft: -$(this).outerWidth() / 2 });
        });
    };

    Slider.prototype.onResize = function () {
        var _this = this;
        this.sizes = {
            domWidth: this.domNode.width(),
            domOffset: this.domNode.offset()
        };

        $.each(this.o.pointers, function (i, pointer) {
            _this.redraw(pointer);
        });
    };

    Slider.prototype.limits = function (x, pointer) {
        if (!this.settings.smooth) {
            var step = this.settings.step * 100 / (this.settings.interval);
            x = Math.round(x / step) * step;
        }

        var another = this.o.pointers[1 - pointer.uid];
        if (another && pointer.uid && x < another.value.prc) {
            x = another.value.prc;
        }

        if (another && !pointer.uid && x > another.value.prc) {
            x = another.value.prc;
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
        if (!this.is.init) {
            return;
        }

        this.setValue();

        if (this.o.pointers.length == 2) {
            var cssProps = {
                left: this.o.pointers[0].value.prc + '%',
                width: (this.o.pointers[1].value.prc - this.o.pointers[0].value.prc) + '%'
            };
            this.o.value.css(cssProps);
        }

        this.o.labels[pointer.uid].value.html(this.nice(pointer.value.origin));

        this.redrawLabels(pointer);
    };

    Slider.prototype.redrawLabels = function (pointer) {
        var label = this.o.labels[pointer.uid], prc = pointer.value.prc, sizes = {
            label: label.o.outerWidth(),
            right: false,
            border: (prc * this.sizes.domWidth) / 100
        };

        if (!this.settings.single) {
            var another = this.o.pointers[1 - pointer.uid], anotherLabel = this.o.labels[another.uid];

            switch (pointer.uid) {
                case 0:
                    if (sizes.border + sizes.label / 2 > (anotherLabel.o.offset().left - this.sizes.domOffset.left)) {
                        anotherLabel.o.css({ visibility: "hidden" });
                        anotherLabel.value.html(this.nice(another.value.origin));

                        label.o.css({ visibility: "visible" });

                        prc = (another.value.prc - prc) / 2 + prc;

                        if (another.value.prc != pointer.value.prc) {
                            label.value.html(this.nice(pointer.value.origin) + '&nbsp;&ndash;&nbsp;' + this.nice(another.value.origin));

                            sizes.label = label.o.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    } else {
                        anotherLabel.o.css({ visibility: 'visible' });
                    }
                    break;

                case 1:
                    if (sizes.border - sizes.label / 2 < anotherLabel.o.offset().left - this.sizes.domOffset.left + anotherLabel.o.outerWidth()) {
                        anotherLabel.o.css({ visibility: 'hidden' });
                        anotherLabel.value.html(this.nice(another.value.origin));

                        label.o.css({ visibility: 'visibility' });

                        prc = (prc - another.value.prc) / 2 + another.value.prc;

                        if (another.value.prc != pointer.value.prc) {
                            label.value.html(this.nice(another.value.origin) + "&nbsp;&ndash;&nbsp;" + this.nice(pointer.value.origin));

                            sizes.label = label.o.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    } else {
                        anotherLabel.o.css({ visibility: 'visible' });
                    }
                    break;
            }
        }

        this.setPosition(label, sizes, prc);

        if (anotherLabel) {
            sizes = {
                label: anotherLabel.o.outerWidth(),
                right: false,
                border: (another.value.prc * this.sizes.domWidth) / 100
            };

            this.setPosition(anotherLabel, sizes, another.value.prc);
        }

        this.redrawLimits();
    };

    Slider.prototype.redrawLimits = function () {
        if (this.settings.limits) {
            var limits = [true, true];

            for (var key in this.o.pointers) {
                if (!this.settings.single || key == 0) {
                    var pointer = this.o.pointers[key], label = this.o.labels[pointer.uid], labelLeft = label.o.offset().left - this.sizes.domOffset.left;

                    if (labelLeft < this.o.limits[0].o.outerWidth()) {
                        limits[0] = false;
                    }

                    if (labelLeft + label.o.outerWidth() > this.sizes.domWidth - this.o.limits[1].o.outerWidth()) {
                        limits[1] = false;
                    }
                }
            }

            for (var i = 0; i < limits.length; i++) {
                if (limits[i]) {
                    this.o.limits[i].o.fadeIn('fast');
                } else {
                    this.o.limits[i].o.fadeOut('fast');
                }
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

        label.o.css(cssProps);

        if (sizes.right) {
            label.o.css({ left: "auto", right: 0 });
        }

        return sizes;
    };

    Slider.prototype.setValue = function () {
        var value = this.getValue();

        this.inputNode.val(value);

        this.onStateChange(value);
    };

    Slider.prototype.getValue = function () {
        var _this = this;
        if (!this.is.init) {
            return false;
        }

        var value = '';

        $.each(this.o.pointers, function (i, pointer) {
            if (pointer.value.prc != undefined && !isNaN(pointer.value.prc)) {
                value += (i > 0 ? ';' : '') + _this.prcToValue(pointer.value.prc);
            }
        });

        return value;
    };

    Slider.prototype.getPrcValue = function () {
        if (!this.is.init) {
            return false;
        }

        var value = '';
        $.each(this.o.pointers, function (i, pointer) {
            if (pointer.value.prc != undefined && !isNaN(pointer.value.prc)) {
                value += (i > 0 ? ';' : '') + pointer.value.prc;
            }
        });

        return value;
    };

    Slider.prototype.prcToValue = function (prc) {
        if (this.settings.hetrogeneity && this.settings.hetrogeneity.length > 0) {
            var heterogeneity = this.settings.hetrogeneity, start = 0, from = this.settings.from, value;

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
            var hetrogeneity = this.settings.hetrogeneity, start = 0, from = this.settings.from, v;

            for (var i = 0; i <= hetrogeneity.length; i++) {
                if (hetrogeneity[i]) {
                    v = hetrogeneity[i].split('/');
                } else {
                    v = [100, this.settings.to];
                }

                v[0] = Number(v[0]);
                v[1] = Number(v[1]);

                if (value >= from && value <= v[1]) {
                    prc = pointer.limits(start + (value - from) * (v[0] - start) / (v[1] - from));
                }

                start = v[0];
                from = v[1];
            }
        } else {
            prc = pointer.limits((value - this.settings.from) * 100 / this.settings.interval);
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

    Slider.prototype.nice = function (value) {
        value = value.toString().replace(/,/gi, ".").replace(/ /gi, "");

        if ($.formatNumber) {
            return $.formatNumber(Number(value), this.settings.format || {}).replace(/-/gi, "&minus;");
        }

        return Number(value);
    };
    return Slider;
})();
