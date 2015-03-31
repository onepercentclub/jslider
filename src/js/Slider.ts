/// <reference path="interfaces.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./SliderPointer.ts" />
/// <reference path="./SliderTemplate.ts" />
/// <reference path="./SliderValueLabel.ts" />
/// <reference path="./SliderLimitLabel.ts" />
/// <reference path="./SliderUXComponent.ts" />
/// <reference path="./helpers/MathHelper.ts" />

class Slider extends SliderUXComponent
{

    public static POINTER_FROM:number = 0;
    public static POINTER_TO:number = 1;
    public static CLASSNAME:string = 'jslider';
    public static SELECTOR:string = '.jslider-';

    public $input:JQuery;
    public $value:JQuery;

    private defaultSettings:ISliderSettings = {
        from: 1,
        to: 10,
        step: 1,
        smooth: true,
        limits: true,
        round: 0,
        format: { format: "#,##0.##" },
        value: '5;7',
        dimension: null,
		heterogeneity: null,
        distance: {
            min: null,
            max: null
        }
    };

    public components:{
        pointers:SliderPointer[];
        limits:SliderLimitLabel[];
        labels:SliderValueLabel[];
    };

    public sizes:ISliderSizes;

    public settings:ISliderSettings;
	
	public hammerManager:HammerManager;

    /**
     * @param inputNode
     * @param settings
     */
    constructor(inputNode:HTMLInputElement, settings:ISliderSettings = {})
    {
        super();

        this.settings = jQuery.extend(this.defaultSettings, settings);

        this.$input = jQuery(inputNode).hide();

        if (this.$input.prop('tagName') !== 'INPUT')
        {
            throw "jquery.slider: Slider must only be applied to INPUT elements.";
        }

        this.settings.interval = this.settings.to - this.settings.from;
        this.settings.value = this.$input.val();

        if (this.settings.value === null || this.settings.value === undefined)
        {
            throw "jquery.slider: INPUT element does not have a value.";
        }

        if (this.settings.calculate && jQuery.isFunction(this.settings.calculate))
        {
            this.calculate = this.settings.calculate;
        }

        this.components = {
            limits: [],
            pointers: [],
            labels: []
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

    /**
     * @param params
     * @returns {Slider}
     */
    public create(params?:Object):SliderUXComponent
    {
        this.template = new SliderTemplate(
            '<span class="<%=className%>">' +
                '<div class="<%=className%>-bg">' +
                '<i class="l"></i><i class="f"></i><i class="r"></i>' +
                '<i class="v"></i>' +
                '</div>' +

                (this.settings.scale ? '<div class="<%=className%>-scale"><%=scale%></div>' : '') +

                '</span>'
        );
        super.create(params);

        this.$input.after(this.$el);

        this.drawScale();

        var values:string[] = this.settings.value.split(';');
        if (values.length == 1)
        {
            this.settings.single = true;
            this.$el.addDependClass('single')
        }
        else if (values.length > 2)
        {
            throw "jquery.slider: Only two handles are supported";
        }

        if (!this.settings.limits)
        {
            this.$el.addDependClass('limitless');
        }

        if (this.settings.skin)
        {
            this.setSkin(this.settings.skin.toString());
        }

        this.sizes = {
            domWidth: this.$el.width(),
            domOffset: this.$el.offset()
        };

        this.components = {
            pointers: [],
            limits: [],
            labels: []
        };

        this.createLimitLabels();

        values.forEach((value:string, uid:number)=>
        {
            var typedValue:number = parseInt(value, 10);
            var prev:number = parseInt(values[uid - 1], 10);

            if (isNaN(typedValue))
            {
                throw "jquery.slider: Invalid value: \"" + value.toString() + "\". Values must be integers.";
            }
            else if (!isNaN(prev) && typedValue < prev)
            {
                typedValue = prev;
            }

            typedValue = MathHelper.clamp(typedValue, this.settings.from, this.settings.to);

            this.components.pointers[uid] = new SliderPointer({
                id: uid,
                value: typedValue,
                $scope: this
            });

            this.components.pointers[uid].redrawLabels();
        });

        if (!this.settings.single)
        {
            this.$value = this.$el.find('.v');
        }

        jQuery.each(this.getPointers(), (i:number, pointer:SliderPointer)=>
        {
            if (!this.settings.single)
            {
                this.ensurePointerIndex(pointer);
            }
        });

        this.setValue();

        this.setValueElementPosition();

        this.redrawLimits();

        jQuery(window).resize(()=>
        {
            this.redraw();
        });

		this.hammerManager = new Hammer(this.$el.get(0), {
			domEvents: true,
			dragLockToAxis: true,
			preventDefault: true,
			dragBlockHorizontal: true
		});
		
        return this;
    }

    /**
     * @param uid
     * @returns {SliderLimitLabel}
     */
    private createLimitLabels():void
    {
        var template:string;
        var params:Object;
        var limitLabel:SliderLimitLabel;

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
    }

    /**
     * @param pointer
     */
    private ensurePointerIndex(pointer:SliderPointer):void
    {
        var otherPointer:SliderPointer = pointer.getAdjacentPointer();
        if (!pointer.hasSameOrigin(otherPointer))
        {
            return;
        }

        if (pointer.uid == Slider.POINTER_FROM && pointer.get().origin == this.settings.from)
        {
            otherPointer.setIndexOver();
        }
        else if (pointer.uid == Slider.POINTER_TO && pointer.get().origin == this.settings.to)
        {
            otherPointer.setIndexOver();
        }
    }

    /**
     * @param value
     * @returns {boolean}
     */
    public onStateChange(value:string):boolean
    {
        if (this.settings.onStateChange && jQuery.isFunction(this.settings.onStateChange))
        {
            return this.settings.onStateChange.call(this, value);
        }
        return true;
    }

    public disableSlider():void
    {
        this.$el.addClass('disabled');
    }

    public enableSlider():void
    {
        this.$el.removeClass('disabled');
    }

    public update():void
    {
        this.redraw();
        this.drawScale();
    }

    /**
     * @param skinName {string}
     */
    public setSkin(skinName:string):void
    {
        if (this.settings.skin)
        {
            this.$el.removeDependClass(this.settings.skin, '_');
        }

        this.$el.addDependClass(this.settings.skin = skinName, "_");
    }

    /**
     * @param index {number}
     */
    public setPointerIndex(index:number):void
    {
        jQuery.each(this.getPointers(), (i:number, pointer:SliderPointer)=>
        {
            pointer.index(index);
        })
    }

    /**
     * @returns {SliderPointer[]}
     */
    public getPointers():SliderPointer[]
    {
        return this.components.pointers;
    }

    /**
     * @returns {SliderLimitLabel[]}
     */
    public getLimits():SliderLimitLabel[]
    {
        return this.components.limits;
    }

    /**
     * @returns {string}
     */
    private generateScale():string
    {
        if (!this.settings.scale)
        {
            return '';
        }

        var str = '',
            scale = this.settings.scale,
            prc = Math.min(Math.max(0, Math.round((100 / (scale.length - 1)) * 10000) / 10000), 100);

        for (var i = 0; i < scale.length; i++)
        {
            str += '<span style="left: ' + i * prc + '%">' + ( scale[i] != '|' ? '<ins>' + scale[i] + '</ins>' : '' ) + '</span>';
        }

        return str;
    }

    private drawScale():void
    {
        this.$el.find(Slider.SELECTOR + 'scale span ins').each(function ()
        {
            jQuery(this).css({ marginLeft: -jQuery(this).outerWidth() / 2 });
        });
    }

    public redraw():void
    {
        this.sizes = {
            domWidth: this.$el.width(),
            domOffset: this.$el.offset()
        };

        jQuery.each(this.components.pointers, (i:number, pointer:SliderPointer)=>
        {
            this.setValueElementPosition();
            pointer.redrawLabels();
        });

        this.redrawLimits();
        this.setValue();
    }

    public setValueElementPosition():void
    {
        if (this.components.pointers.length == 1)
        {
            return;
        }

        var fromPercent:number = this.components.pointers[Slider.POINTER_FROM].get().prc;
        var toPercent:number = this.components.pointers[Slider.POINTER_TO].get().prc;

        this.$value.css({
            left: fromPercent + '%',
            width: (toPercent - fromPercent) + '%'
        });
    }



    private redrawLimits():void
    {
        if (!this.settings.limits)
        {
            return;
        }

        for (var i = 0; i < this.components.pointers.length; i++)
        {
            var pointer:SliderPointer = this.components.pointers[i];
            var label:SliderValueLabel = pointer.getLabel();
            var labelLeft:number = label.offset().left - this.sizes.domOffset.left;

            if(i == Slider.POINTER_FROM)
            {
                var limitFrom:SliderLimitLabel =  this.components.limits[Slider.POINTER_FROM];

                if (labelLeft < limitFrom.outerWidth())
                {
                    limitFrom.fadeOut('fast');
                }
                else
                {
                    limitFrom.fadeIn('fast');
                }

                if(this.settings.single)
                {
                    var limitTo:SliderLimitLabel =  this.components.limits[Slider.POINTER_TO];
                    if(labelLeft + label.outerWidth() > this.sizes.domWidth - limitTo.outerWidth())
                    {
                        limitTo.fadeOut('fast');
                    }
                    else
                    {
                        limitTo.fadeIn('fast');
                    }
                }
            }
            else if(i == Slider.POINTER_TO)
            {
                var limitTo:SliderLimitLabel = this.components.limits[Slider.POINTER_TO];
                if (labelLeft + label.outerWidth() > this.sizes.domWidth - limitTo.outerWidth())
                {
                    limitTo.fadeOut('fast');
                }
                else
                {
                    limitTo.fadeIn('fast');
                }
            }
        }
    }

    public setValue():void
    {
        var value:string = this.getValue();

        this.$input.val(value);
    }

    /**
     * @returns {string}
     */
    public getValue():string
    {
        var value:string = '';
        jQuery.each(this.getPointers(), (i:number, pointer:SliderPointer)=>
        {
            var prc = pointer.get().prc;
            if (prc && !isNaN(prc))
            {
                value += (i > 0 ? ';' : '') + MathHelper.prcToValue(prc, pointer).toString();
            }
        });

        return value;
    }

    /**
     * @returns {string}
     */
    public getPrcValue():string
    {
        var value:string = '';
        jQuery.each(this.getPointers(), (i:number, pointer:SliderPointer)=>
        {
            var prc = pointer.get().prc;
            if (prc && !isNaN(prc))
            {
                value += (i > 0 ? ';' : '') + prc.toString();
            }
        });

        return value;
    }

    /**
     * @param value
     * @returns {string}
     */
    public calculate(value:any):string
    {
        value = value.toString().replace(/,/gi, ".").replace(/ /gi, "");

        if (jQuery.formatNumber)
        {
            return jQuery.formatNumber(Number(value), this.settings.format || {}).replace(/-/gi, "&minus;");
        }

        return value;
    }

    public destroy():void
    {
        jQuery.each(this.components.pointers, (i:number, sliderPointer:SliderPointer)=>
        {
            sliderPointer.destroy();
        });

        jQuery.each(this.components.labels, (i:number, sliderValueLabel:SliderValueLabel)=>
        {
            sliderValueLabel.destroy();
        });

        jQuery.each(this.components.limits, (i:number, sliderLimitLabel:SliderLimitLabel)=>
        {
            sliderLimitLabel.destroy();
        });

        this.$value.remove();

        this.$el.remove();
    }
}
