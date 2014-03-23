/**
 * Created by davidatborresen on 31.01.14.
 */
/// <reference path="interfaces.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./SliderPointer.ts" />
/// <reference path="./SliderTemplate.ts" />
/// <reference path="./SliderValueLabel.ts" />
/// <reference path="./SliderLimitLabel.ts" />
/// <reference path="./SliderUXComponent.ts" />

class Slider extends SliderUXComponent {

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
        hetrogeneity:null,
        distance: {
            min:null,
            max:null
        }
    };

    public components:{
        pointers:SliderPointer[];
        limits:SliderLimitLabel[];
    };

    private sizes:ISliderSizes;

    public settings:ISliderSettings;

    /**
     * @param inputNode
     * @param settings
     */
    constructor(inputNode:HTMLInputElement, settings:ISliderSettings = {})
    {
        super();

        this.settings = jQuery.extend(this.defaultSettings, settings);

        this.$input = jQuery(inputNode).hide();

        if(this.$input.prop('tagName') !== 'INPUT')
        {
            throw "jquery.slider: Slider must only be applied to INPUT elements.";
        }

        this.settings.interval = this.settings.to - this.settings.from;
        this.settings.value = this.$input.val();

        if(this.settings.value === null || this.settings.value === undefined)
        {
            throw "jquery.slider: INPUT element does not have a value.";
        }

        if(this.settings.calculate && jQuery.isFunction(this.settings.calculate))
        {
            this.calculate = this.settings.calculate;
        }

        this.components = {
            limits:[],
            pointers:[]
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
        if(values.length == 1)
        {
            this.settings.single = true;
            this.$el.addDependClass('single')
        }
        else if(values.length > 2)
        {
            throw "Slider: Only two handles are supported";
        }

        if(!this.settings.limits)
        {
            this.$el.addDependClass('limitless');
        }

        if(this.settings.skin)
        {
            this.setSkin(this.settings.skin.toString());
        }

        this.sizes = {
            domWidth:this.$el.width(),
            domOffset:this.$el.offset()
        };

        this.components = {
           pointers: [],
           limits:[]
        };

        values.forEach((value:string, uid:number)=>
        {
            var typedValue = parseInt(value,10);

            var prev:number = Number(values[uid-1]);

            if(isNaN(typedValue))
            {
                return;
            }

            if(!isNaN(prev) && typedValue < prev)
            {
                typedValue = prev;
            }

            var pointer:SliderPointer = new SliderPointer(uid, this);

            typedValue = (typedValue < this.settings.from) ? this.settings.from : typedValue;
            typedValue = (typedValue > this.settings.to) ? this.settings.to : typedValue;

            pointer.set(typedValue, true);



            this.components.pointers[uid] = pointer;
        });

        this.createLimitLabels();

        if(!this.settings.single)
        {
            this.$value = this.$el.find('.v');
        }

        jQuery.each(this.getPointers(),(i:number,pointer:SliderPointer)=>
        {
            if(!this.settings.single)
            {
                this.ensurePointerIndex(pointer);
            }

            this.redrawLabels(pointer);
        });

        this.setValue();

        this.setValueElementPosition();

        this.redrawLimits();

        jQuery(window).resize(()=>
        {
           this.onResize();
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
    public onStateChange(value:string):any
    {
        if(jQuery.isFunction(this.settings.onStateChange))
        {
            return this.settings.onStateChange.apply(this, value);
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
        this.onResize();
        this.drawScale();
    }

    /**
     * @param skinName {string}
     */
    public setSkin(skinName:string):void
    {
        if(this.settings.skin)
        {
            this.$el.removeDependClass(this.settings.skin,'_');
        }

        this.$el.addDependClass( this.settings.skin = skinName, "_" );
    }

    /**
     * @param index {number}
     */
    public setPointerIndex(index:number):void
    {
        jQuery.each(this.getPointers(),(i:number,pointer:SliderPointer)=>
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
        this.$el.find(Slider.SELECTOR + 'scale span ins').each(function()
        {
            jQuery(this).css({ marginLeft: -jQuery(this).outerWidth() / 2 });
        });
    }

    private onResize():void
    {
        this.sizes = {
            domWidth: this.$el.width(),
            domOffset:this.$el.offset()
        };

        jQuery.each(this.components.pointers, (i:number, pointer:SliderPointer)=>
        {
            this.redraw(pointer);
        });
    }

    /**
     * @param x {number}
     * @param pointer {SliderPointer}
     */
    public calcLimits(x:number, pointer:SliderPointer):number
    {
        if(!this.settings.smooth)
        {
            var step = this.settings.step * 100 / (this.settings.interval);
            x = Math.round( x / step ) * step;
        }

        var another:SliderPointer = pointer.getAdjacentPointer();
        if(another && pointer.uid && x < another.get().prc)
        {
            x = another.get().prc;
        }

        if (another && !pointer.uid && x > another.get().prc)
        {
            x = another.get().prc;
        }

        if(x < 0)
        {
            x = 0;
        }

        if(x > 100)
        {
            x = 100;
        }

        return Math.round(x * 10) / 10;
    }

    /**
     * @param pointer {SliderPointer}
     */
    public redraw(pointer:SliderPointer):void
    {
        if(!this.isInitialized())
        {
            return;
        }

        this.setValue();

        this.setValueElementPosition();

        this.redrawLabels(pointer);
    }

    public setValueElementPosition():void
    {
        if(this.components.pointers.length == 1)
        {
            return;
        }

        var fromPercent:number = this.components.pointers[Slider.POINTER_FROM].get().prc;
        var toPercent:number = this.components.pointers[Slider.POINTER_TO].get().prc;

        this.$value.css({
            left:  fromPercent + '%',
            width: (toPercent - fromPercent) + '%'
        });
    }

    /**
     * @param pointer {SliderPointer}
     */
    public redrawLabels(pointer:SliderPointer):void
    {
        var label = pointer.getLabel();

        label.setValue(
            this.calculate(
                pointer.get().origin
            )
        );

        var prc:number = pointer.get().prc;
        var sizes = {
                label: label.outerWidth(),
                right: false,
                border: (prc * this.sizes.domWidth) / 100
            };

        if(!this.settings.single && pointer.getAdjacentPointer())
        {
            var otherPointer:SliderPointer = pointer.getAdjacentPointer();
            var otherLabel:SliderValueLabel = otherPointer.getLabel();

            switch(pointer.uid)
            {
                case Slider.POINTER_FROM:
                    if(sizes.border+sizes.label / 2 > (otherLabel.offset().left - this.sizes.domOffset.left))
                    {
                        otherLabel.css({ visibility: "hidden" });
                        otherLabel.setValue(
                            this.calculate(
                              otherPointer.get().origin
                            )
                        );

                        label.css({ visibility: "visible" });

                        prc = (otherPointer.get().prc - prc) / 2 + prc;

                        if(otherPointer.get().prc != pointer.get().prc)
                        {
                            label.setValue(
                                this.calculate(pointer.get().origin)
                                    + '&nbsp;&ndash;&nbsp;' +
                                this.calculate(otherPointer.get().origin)
                            );

                            sizes.label = label.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    }
                    else
                    {
                        otherLabel.css({visibility:'visible'});
                    }
                    break;

                case Slider.POINTER_TO:
                    if(sizes.border - sizes.label / 2 < (otherLabel.offset().left - this.sizes.domOffset.left) + otherLabel.outerWidth())
                    {
                        otherLabel.css({visibility: 'hidden'});
                        otherLabel.setValue(
                            this.calculate(
                                otherPointer.get().origin
                            )
                        );

                        label.css({visibility: 'visible'});

                        prc = (prc - otherPointer.get().prc) / 2 + otherPointer.get().prc;

                        if (otherPointer.get().prc != pointer.get().prc)
                        {
                            label.setValue(
                                this.calculate(otherPointer.get().origin)
                                    + "&nbsp;&ndash;&nbsp;" +
                                this.calculate(pointer.get().origin)
                            );

                            sizes.label = label.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    }
                    else
                    {
                        otherLabel.css({visibility:'visible'});
                    }
                    break;
            }
        }

        this.setPosition(label, sizes, prc);

        if(otherLabel)
        {
            sizes = {
                label: otherLabel.outerWidth(),
                right:false,
                border:(otherPointer.value.prc * this.sizes.domWidth) / 100
            };

            this.setPosition(otherLabel, sizes, otherPointer.value.prc);
        }
    }

    private redrawLimits():void
    {
        if(!this.settings.limits)
        {
            return;
        }

        var limits = [true, true];

        for(var key in this.components.pointers)
        {
            if(!this.settings.single || key == 0)
            {
                if(!this.components.pointers.hasOwnProperty(key))
                {
                    continue;
                }

                var pointer:SliderPointer = this.components.pointers[key];
                var label = pointer.getLabel();
                var labelLeft = label.offset().left - this.sizes.domOffset.left;

                if(labelLeft < this.components.limits[Slider.POINTER_FROM].outerWidth())
                {
                    limits[0] = false;
                }

                if(labelLeft + label.outerWidth() > this.sizes.domWidth - this.components.limits[Slider.POINTER_TO].outerWidth())
                {
                    limits[1] = false;
                }
            }
        }

        for(var i = 0; i < limits.length; i++)
        {
            if(!(this.components.limits[i] instanceof SliderLimitLabel))
            {
                continue;
            }

            if(limits[i])
            {
                this.components.limits[i].fadeIn('fast');
            }
            else
            {
                this.components.limits[i].fadeOut('fast');
            }
        }
    }

    /**
     * @param label
     * @param sizes
     * @param prc
     * @returns {ISliderSizes}
     */
    private setPosition(label:SliderValueLabel, sizes:any, prc:number):ISliderSizes
    {
        sizes.margin = -sizes.label / 2;

        // left limit
        var labelLeft = sizes.border + sizes.margin;
        if (labelLeft < 0)
        {
            sizes.margin -= labelLeft;
        }

        // right limit
        if (sizes.border + sizes.label / 2 > this.sizes.domWidth)
        {
            sizes.margin = 0;
            sizes.right = true;
        }
        else
        {
            sizes.right = false;
        }

        var cssProps = {
            left: prc + '%',
            marginLeft: sizes.margin,
            right: 'auto'
        };

        label.css(cssProps);

        if (sizes.right)
        {
            label.css({ left: "auto", right: 0 });
        }

        return sizes;
    }

    public setValue():void
    {
        var value = this.getValue();

        this.$input.val(value);

        this.onStateChange(value);
    }

    /**
     * @returns {*}
     */
    public getValue():any
    {
        if(!this.isInitialized())
        {
            return false;
        }

        var value:string = '';
        jQuery.each(this.getPointers(),(i:number,pointer:SliderPointer)=>
        {
            if(pointer.get().prc != undefined && !isNaN(pointer.get().prc))
            {
                value += (i > 0 ? ';':'') + this.prcToValue(pointer.get().prc);
            }
        });

        return value;
    }

    /**
     * @returns {*}
     */
    public getPrcValue():any
    {
        if(!this.isInitialized())
        {
            return false;
        }

        var value = '';
        jQuery.each(this.getPointers(), (i:number, pointer:SliderPointer)=>
        {
            if (pointer.get().prc != undefined && !isNaN(pointer.get().prc))
            {
                value += (i > 0 ? ';' : '') + pointer.get().prc;
            }
        });

        return value;
    }

    /**
     * @param prc
     * @returns {number}
     */
    public prcToValue(prc:number):number
    {
        if(this.settings.hetrogeneity && this.settings.hetrogeneity.length > 0)
        {
            var heterogeneity:string = this.settings.hetrogeneity;
            var start:number = 0;
            var from = this.settings.from;
            var value:any;

            for (var i = 0; i <= heterogeneity.length; i++)
            {
                var v:any[];
                if(heterogeneity[i])
                {
                    v = heterogeneity[i].split('/');
                }
                else
                {
                    v = [100, this.settings.to];
                }

                v[0] = Number(v[0]);
                v[1] = Number(v[1]);

                if(prc >= start && prc <= v[0])
                {
                    value = from + ((prc - start) * (v[1]-from)) / (v[0]-start);
                }

                start = v[0];
                from = v[1];
            }
        }
        else
        {
            value = this.settings.from + (prc * this.settings.interval) / 100;
        }

        return this.round(value);
    }

    /**
     * @param value
     * @param pointer
     */
    public valueToPrc(value:any,pointer:SliderPointer):any
    {
        var prc:any;
        if(this.settings.hetrogeneity && this.settings.hetrogeneity.length > 0)
        {
            var hetrogeneity:string = this.settings.hetrogeneity;
            var start:number = 0;
            var from:number = this.settings.from;
            var v:any;

            for(var i = 0; i <= hetrogeneity.length; i++)
            {
                if(hetrogeneity[i])
                {
                    v = hetrogeneity[i].split('/');
                }
                else
                {
                    v = [100, this.settings.to];
                }

                v[0] = Number(v[0]);
                v[1] = Number(v[1]);

                if (value >= from && value <= v[1])
                {
                    prc = pointer.calcLimits(start + (value - from) * (v[0] - start) / (v[1] - from));
                }

                start = v[0];
                from = v[1];
            }
        }
        else
        {
            prc = pointer.calcLimits((value - this.settings.from) * 100 / this.settings.interval);
        }

        return prc;
    }

    /**
     * @param value
     * @returns {number}
     */
    public round(value:number):number
    {
        value = Math.round(value / this.settings.step) * this.settings.step;

        if(this.settings.round)
        {
            value = Math.round(value * Math.pow(10, this.settings.round)) / Math.pow(10,this.settings.round);
        }
        else
        {
            value = Math.round(value);
        }

        return value;
    }

    /**
     * @param value
     * @returns {*}
     */
    public calculate(value:any):string
    {
        value = value.toString().replace(/,/gi, ".").replace(/ /gi, "");

        if(jQuery.formatNumber)
        {
            return jQuery.formatNumber(Number(value), this.settings.format || {}).replace( /-/gi, "&minus;" );
        }

        return Number(value).toString();
    }

    public destroy():void
    {
        jQuery.each(this.components.pointers, (i:number,sliderPointer:SliderPointer)=>
        {
            sliderPointer.destroy();
        });

        jQuery.each(this.components.labels, (i:number,sliderValueLabel:SliderValueLabel)=>
        {
            sliderValueLabel.destroy();
        });

        jQuery.each(this.components.limits, (i:number,sliderLimitLabel:SliderLimitLabel)=>
        {
            sliderLimitLabel.destroy();
        });

        this.$value.remove();

        this.$el.remove();
    }
}
