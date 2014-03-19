/**
 * Created by davidatborresen on 31.01.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./jquery.sliderPointer.ts" />
/// <reference path="./jquery.sliderTemplate.ts" />
/// <reference path="./jquery.sliderValueLabel.ts" />
/// <reference path="./jquery.sliderLimitLabel.ts" />

interface IDistance {
    min:number;
    max:number;
}

interface ISliderSettings {
    to?:number;
    from?:number;
    interval?:number;
    value?:string;
    calculate?:() => string;
    onStateChange?:() => boolean;
    dimension?:string;
    skin?:string;
    limits?:any;
    single?:boolean;
    scale?:string;
    hetrogeneity?:string;
    step?:number;
    round?:number;
    smooth?:boolean;
    distance?:IDistance;
    format?:Object;
    maxDistance?:number;
}

interface ISliderState {
    init:boolean;
}

interface ISliderSizes {
    domWidth:number;
    domOffset:IOffset;
}

interface ISliderComponents
{
    value?:JQuery;
    labels?: SliderValueLabel[];
    limits?: SliderLimitLabel[];
    pointers?: SliderPointer[];
}

class Slider {

    public static POINTER_FROM:number = 0;
    public static POINTER_TO:number = 1;
    public static CLASSNAME:string = 'jslider';
    public static SELECTOR:string = '.jslider-';

    public $el:JQuery;
    public $input:JQuery;

    private defaultSettings:ISliderSettings = {
        from: 1,
        to: 10,
        step: 1,
        smooth: true,
        limits: true,
        round: 0,
        format: { format: "#,##0.##" },
        value: '5;7',
        dimension: '',
        distance: {
            min:null,
            max:null
        }
    };

    private template:SliderTemplate = new SliderTemplate(
        '<span class="<%=className%>">' +
        '<div class="<%=className%>-bg">' +
        '<i class="l"></i><i class="f"></i><i class="r"></i>' +
        '<i class="v"></i>' +
        '</div>' +

        '<div class="<%=className%>-pointer"></div>' +
        '<div class="<%=className%>-pointer <%=className%>-pointer-to"></div>' +

        '<div class="<%=className%>-label"><span><%=settings.from%></span></div>' +
        '<div class="<%=className%>-label <%=className%>-label-to"><span><%=settings.to%></span><%=settings.dimension%></div>' +

        '<div class="<%=className%>-value"><span></span><%=settings.dimension%></div>' +
        '<div class="<%=className%>-value <%=className%>-value-to"><span></span><%=settings.dimension%></div>' +

        '<div class="<%=className%>-scale"><%=scale%></div>' +

        '</span>'
    );

    private sizes:ISliderSizes;

    private is:ISliderState = {
        init:false
    };

    private components:ISliderComponents;

    public settings:ISliderSettings;

    /**
     * @param inputNode
     * @param settings
     */
    constructor(inputNode:HTMLInputElement, settings:ISliderSettings = {})
    {
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

        this.create();
    }

    public create():void
    {
        this.$el = jQuery(this.template.render({
            className: Slider.CLASSNAME,
            settings: {
                from: this.calculate(this.settings.from),
                to: this.calculate(this.settings.to),
                dimension: this.settings.dimension
            },
            scale: this.generateScale()
        }));

        this.$input.after(this.$el);

        this.drawScale();

        var values:string[] = this.settings.value.split(';');
        if(values.length == 1)
        {
            this.settings.single = true;
            this.$el.addDependClass('single')
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

        var valueLabels:JQuery = this.$el.find(Slider.SELECTOR + 'value');
        var limitLabels:JQuery = this.$el.find(Slider.SELECTOR + 'label');

        this.components = {
           pointers: [],
           labels: [
                new SliderValueLabel(valueLabels.not(Slider.SELECTOR + 'value-to')),
                new SliderValueLabel(valueLabels.filter(Slider.SELECTOR + 'value-to'))
           ],
           limits:[
               new SliderLimitLabel(limitLabels.not(Slider.SELECTOR + 'label-to')),
               new SliderLimitLabel(limitLabels.filter(Slider.SELECTOR + 'label-to'))
           ]
        };

        this.$el.find(Slider.SELECTOR + 'pointer').each((i:number, element:HTMLElement)=>
        {
            var value:number = Number(values[i]);
            var prev:number = Number(values[i-1]);

            if(isNaN(value))
            {
                return;
            }

            if(!isNaN(prev) && value < prev)
            {
                value = prev;
            }

            var pointer:SliderPointer = new SliderPointer(element, i, this);

            value = (value < this.settings.from) ? this.settings.from : value;
            value = (value > this.settings.to) ? this.settings.to : value;

            pointer.set(value,true);

            this.components.pointers[i] = pointer;
        });

        this.components.value = this.$el.find('.v');

        this.is.init = true;

        jQuery.each(this.components.pointers,(i:number,pointer:SliderPointer)=>
        {
            if(!this.settings.single)
            {
                this.ensurePointerIndex(pointer);
            }

            this.redraw(pointer);
        });

        jQuery(window).resize(()=>
        {
           this.onResize();
        });
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
    private setSkin(skinName:string):void
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
    public limits(x:number, pointer:SliderPointer):number
    {
        if(!this.settings.smooth)
        {
            var step = this.settings.step * 100 / (this.settings.interval);
            x = Math.round( x / step ) * step;
        }

        var another = this.components.pointers[1-pointer.uid];
        if(another && pointer.uid && x < another.value.prc)
        {
            x = another.value.prc;
        }

        if( another && !pointer.uid && x > another.value.prc )
        {
            x = another.value.prc;
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
        if(!this.is.init)
        {
            return;
        }

        this.setValue();

        this.setValueElementPosition();

        this.redrawLabels(pointer);
    }

    public setValueElementPosition():void
    {
        if(this.components.pointers.length == 2)
        {
            var cssProps = {
                left:this.components.pointers[Slider.POINTER_FROM].value.prc + '%',
                width:(this.components.pointers[Slider.POINTER_TO].value.prc - this.components.pointers[0].value.prc) + '%'
            };
            this.components.value.css(cssProps);
        }
    }

    /**
     * @param pointer {SliderPointer}
     */
    public redrawLabels(pointer:SliderPointer):void
    {
        var label = this.components.labels[pointer.uid];

        label.setValue(
            this.calculate(
                pointer.value.origin
            )
        );

        var prc = pointer.value.prc;
        var sizes = {
                label: label.outerWidth(),
                right: false,
                border: (prc * this.sizes.domWidth) / 100
            };

        if(!this.settings.single)
        {
            var another:SliderPointer = pointer.getAdjacentPointer(),
                anotherLabel = this.components.labels[another.uid];

            switch(pointer.uid)
            {
                case Slider.POINTER_FROM:
                    if(sizes.border+sizes.label / 2 > (anotherLabel.offset().left - this.sizes.domOffset.left))
                    {
                        anotherLabel.css({ visibility: "hidden" });
                        anotherLabel.setValue(
                            this.calculate(
                              another.value.origin
                            )
                        );

                        label.css({ visibility: "visible" });

                        prc = (another.value.prc - prc) / 2 + prc;

                        if(another.value.prc != pointer.value.prc)
                        {
                            label.setValue(
                                this.calculate(pointer.value.origin)
                                    + '&nbsp;&ndash;&nbsp;' +
                                this.calculate(another.value.origin)
                            );

                            sizes.label = label.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    }
                    else
                    {
                        anotherLabel.css({visibility:'visible'});
                    }
                    break;

                case Slider.POINTER_TO:
                    if(sizes.border - sizes.label / 2 < (anotherLabel.offset().left - this.sizes.domOffset.left) + anotherLabel.outerWidth())
                    {
                        anotherLabel.css({visibility: 'hidden'});
                        anotherLabel.setValue(
                            this.calculate(
                                another.value.origin
                            )
                        );

                        label.css({visibility: 'visible'});

                        prc = (prc - another.value.prc) / 2 + another.value.prc;

                        if (another.value.prc != pointer.value.prc)
                        {
                            label.setValue(
                                this.calculate(another.value.origin)
                                    + "&nbsp;&ndash;&nbsp;" +
                                this.calculate(pointer.value.origin)
                            );

                            sizes.label = label.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    }
                    else
                    {
                        anotherLabel.css({visibility:'visible'});
                    }
                    break;
            }
        }

        this.setPosition(label, sizes, prc);

        if(anotherLabel)
        {
            sizes = {
                label: anotherLabel.outerWidth(),
                right:false,
                border:(another.value.prc * this.sizes.domWidth) / 100
            };

            this.setPosition(anotherLabel, sizes, another.value.prc);
        }

        this.redrawLimits();
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

                var pointer:SliderPointer = this.components.pointers[key],
                    label = this.components.labels[pointer.uid],
                    labelLeft = label.offset().left - this.sizes.domOffset.left;

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
    private setPosition(label:any, sizes:any, prc:number):ISliderSizes
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
        if(!this.is.init)
        {
            return false;
        }

        var value = '';

        jQuery.each(this.components.pointers,(i:number,pointer:SliderPointer)=>
        {
            if(pointer.value.prc != undefined && !isNaN(pointer.value.prc))
            {
                value += (i > 0 ? ';':'') + this.prcToValue(pointer.value.prc);
            }
        });

        return value;
    }

    /**
     * @returns {*}
     */
    public getPrcValue():any
    {
        if(!this.is.init)
        {
            return false;
        }

        var value = '';
        jQuery.each( this.components.pointers, (i:number,pointer:SliderPointer)=>
        {
            if( pointer.value.prc != undefined && !isNaN(pointer.value.prc) )
            {
                value += (i > 0 ? ';' : '') + pointer.value.prc;
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
            var heterogeneity = this.settings.hetrogeneity,
                start = 0,
                from = this.settings.from,
                value:any;

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
            var hetrogeneity = this.settings.hetrogeneity,
                start = 0,
                from = this.settings.from,
                v:any;

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
                    prc = pointer.limits(start + (value - from) * (v[0] - start) / (v[1] - from));
                }

                start = v[0];
                from = v[1];
            }
        }
        else
        {
            prc = pointer.limits((value - this.settings.from) * 100 / this.settings.interval);
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
    private calculate(value:any):string
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

        this.components.value.remove();

        this.$el.remove();
    }
}
