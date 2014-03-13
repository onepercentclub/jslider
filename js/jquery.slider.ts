/**
 * Created by davidatborresen on 31.01.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../js/jquery.sliderPointer.ts" />

interface ISettings {
    to:number;
    from:number;
    interval:number;
    value:string;
    calculate:() => number;
    onStateChange:() => boolean;
    dimension:string;
    skin:string;
    limits:string;
    single:boolean;
    scale:string;
    hetrogeneity:string;
    step:number;
    round:number;
    smooth:boolean;
    minDistance:number;
    maxDistance:number;
}

interface ISizes {
    domWidth:number;
    domOffset:IOffset;
}

class Slider {

    public static POINTER_LEFT:number = 0;
    public static POINTER_RIGHT:number = 1;

    public domNode:JQuery;
    private defaultOptions = {

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

        template: tmpl(
            '<span class="<%=className%>">' +
                '<table><tr><td>' +
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

                '</td></tr></table>' +
                '</span>'
        )

    };
    private inputNode:JQuery;
    private sizes:ISizes;

    private is:Object = {
        init:false
    };
    private o:Object = {};

    public settings:ISettings;

    constructor(...args)
    {
        this.init.apply(this, args);
    }

    /**
     * @param node
     * @param settings
     */
    public init(node:HTMLElement, settings:ISettings):void
    {
        this.settings = jQuery.extend(true, {}, this.defaultOptions.settings, settings);

        this.inputNode = jQuery(node).hide();

        if(this.inputNode.prop('tagName') !== 'INPUT')
        {
            throw "jquery.slider: Slider must only be applied to INPUT elements.";
        }

        this.settings.interval = this.settings.to - this.settings.from;
        this.settings.value = this.inputNode.val();

        if(this.settings.value === null || this.settings.value === undefined)
        {
            throw "jquery.slider: INPUT element does not have a value.";
        }

        if(this.settings.calculate && jQuery.isFunction(this.settings.calculate))
        {
            this.nice = this.settings.calculate;
        }

        this.create();
    }

    public create():void
    {
        this.domNode = jQuery(this.defaultOptions.template({
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

        if(this.settings.skin && this.settings.skin.length > 0)
        {
            this.setSkin(this.settings.skin);
        }

        this.sizes = {
            domWidth:this.domNode.width(),
            domOffset:this.domNode.offset()
        };

        jQuery.extend(this.o, {
           pointers: [],
           labels: [
               {
                   o:this.domNode.find(this.defaultOptions.selector + 'value').not(this.defaultOptions.selector + 'value-to')
               },
               {
                   o:this.domNode.find(this.defaultOptions.selector + 'value').filter(this.defaultOptions.selector + 'value-to')
               }
           ],
           limits:[
               {
                   o:this.domNode.find(this.defaultOptions.selector + 'label').not(this.defaultOptions.selector + 'label-to')
               },
               {
                   o:this.domNode.find(this.defaultOptions.selector + 'label').filter(this.defaultOptions.selector + 'label-to')
               }
           ]
        });

        jQuery.extend(this.o.labels[0], {
           value: this.o.labels[0].o.find('span')
        });

        jQuery.extend(this.o.labels[1], {
           value: this.o.labels[1].o.find('span')
        });

        if(!this.settings.value.split(';')[1])
        {
            this.settings.single = true;
            this.domNode.addDependClass('single')
        }

        if(!this.settings.limits)
        {
            this.domNode.addDependClass('limitless');
        }

        var values:string[] = this.settings.value.split(';');
        this.domNode.find(this.defaultOptions.selector + 'pointer').each((i:number, element:HTMLElement)=>
        {
            var value:number = Number(values[i]);

            if(value)
            {
                this.o.pointers[i] = new SliderPointer(element, i, this);
                var prev = Number(values[i-1]);

                if(prev && value < prev)
                {
                    value = prev;
                }

                value = (value < this.settings.from) ? this.settings.from : value;
                value = (value > this.settings.to) ? this.settings.to : value;

                this.o.pointers[i].set(value, true);
            }
        });

        this.o.value = this.domNode.find('.v');
        this.is.init = true;

        jQuery.each(this.o.pointers,(i:number,pointer:SliderPointer)=>
        {
            this.redraw(pointer);
        });

        jQuery(window).resize(()=>
        {
           this.onResize();
        });
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
        this.domNode.addClass('disabled');
    }

    public enableSlider():void
    {
        this.domNode.removeClass('disabled');
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
        if(this.skin)
        {
            this.domNode.removeDependClass(this.skin,'_');
        }
        else
        {
            this.domNode.addDependClass( this.skin = skinName, "_" );
        }
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
    private getPointers():SliderPointer[]
    {
        return this.o.pointers;
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
        this.domNode.find(this.defaultOptions.selector + 'scale span ins').each(function()
        {
            jQuery(this).css({ marginLeft: -jQuery(this).outerWidth() / 2 });
        });
    }

    private onResize():void
    {
        this.sizes = {
            domWidth: this.domNode.width(),
            domOffset:this.domNode.offset()
        };

        jQuery.each(this.o.pointers, (i:number, pointer:SliderPointer)=>
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

        var another = this.o.pointers[1-pointer.uid];
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

        if (this.settings.minDistance && this.shouldPreventPositionUpdate(pointer))
        {
            return;
        }

        this.setValue();

        this.setValueElementPosition();

        this.redrawLabels(pointer);
    }

    public setValueElementPosition():void
    {
        if(this.o.pointers.length == 2)
        {
            var cssProps = {
                left:this.o.pointers[0].value.prc + '%',
                width:(this.o.pointers[1].value.prc - this.o.pointers[0].value.prc) + '%'
            };
            this.o.value.css(cssProps);
        }
    }

    /**
     * @param pointer
     * @returns {boolean}
     */
    public shouldPreventPositionUpdate(pointer:SliderPointer):boolean
    {
        var another:SliderPointer = this.o.pointers[1-pointer.uid];

        if(!another)
        {
            return false;
        }

        switch(pointer.uid)
        {
            case Slider.POINTER_LEFT:
                if((pointer.value.origin + this.settings.minDistance) == another.value.origin)
                {
                    return true;
                }
                break;

            case Slider.POINTER_RIGHT:
                if((pointer.value.origin - this.settings.minDistance) == another.value.origin)
                {
                    return true;
                }
                break;
        }

        return false;
    }

    /**
     * @param pointer {SliderPointer}
     */
    public redrawLabels(pointer:SliderPointer):void
    {
        this.o.labels[pointer.uid].value.html(
            this.nice(
                pointer.value.origin
            )
        );

        var label = this.o.labels[pointer.uid],
            prc = pointer.value.prc,
            sizes = {
                label: label.o.outerWidth(),
                right: false,
                border: (prc * this.sizes.domWidth) / 100
            };

        if(!this.settings.single)
        {
            var another:SliderPointer = this.o.pointers[1-pointer.uid],
                anotherLabel = this.o.labels[another.uid];

            switch(pointer.uid)
            {
                case 0:
                    if(sizes.border+sizes.label / 2 > (anotherLabel.o.offset().left - this.sizes.domOffset.left))
                    {
                        anotherLabel.o.css({ visibility: "hidden" });
                        anotherLabel.value.html(
                            this.nice(
                                another.value.origin
                            )
                        );

                        label.o.css({ visibility: "visible" });

                        prc = (another.value.prc - prc) / 2 + prc;

                        if(another.value.prc != pointer.value.prc)
                        {
                            label.value.html(
                                this.nice(pointer.value.origin)
                                + '&nbsp;&ndash;&nbsp;' +
                                this.nice(another.value.origin)
                            );

                            sizes.label = label.o.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    }
                    else
                    {
                        anotherLabel.o.css({visibility:'visible'});
                    }
                    break;

                case 1:
                    if(sizes.border - sizes.label / 2 < (anotherLabel.o.offset().left - this.sizes.domOffset.left) + anotherLabel.o.outerWidth())
                    {
                        anotherLabel.o.css({visibility: 'hidden'});
                        anotherLabel.value.html(this.nice(another.value.origin));

                        label.o.css({visibility: 'visible'});

                        prc = (prc - another.value.prc) / 2 + another.value.prc;

                        if (another.value.prc != pointer.value.prc)
                        {
                            label.value.html(
                                this.nice(another.value.origin)
                                    + "&nbsp;&ndash;&nbsp;" +
                                this.nice(pointer.value.origin)
                            );

                            sizes.label = label.o.outerWidth();
                            sizes.border = (prc * this.sizes.domWidth) / 100;
                        }
                    }
                    else
                    {
                        anotherLabel.o.css({visibility:'visible'});
                    }
                    break;
            }
        }

        this.setPosition(label, sizes, prc);

        if(anotherLabel)
        {
            sizes = {
                label: anotherLabel.o.outerWidth(),
                right:false,
                border:(another.value.prc * this.sizes.domWidth) / 100
            };

            this.setPosition(anotherLabel, sizes, another.value.prc);
        }

        this.redrawLimits();
    }

    private redrawLimits():void
    {
        if(this.settings.limits)
        {
            var limits = [true, true];

            for(var key in this.o.pointers)
            {
                if(!this.settings.single || key == 0)
                {
                    var pointer = this.o.pointers[key],
                        label = this.o.labels[pointer.uid],
                        labelLeft = label.o.offset().left - this.sizes.domOffset.left;

                    if(labelLeft < this.o.limits[0].o.outerWidth())
                    {
                        limits[0] = false;
                    }

                    if(labelLeft + label.o.outerWidth() > this.sizes.domWidth - this.o.limits[1].o.outerWidth())
                    {
                        limits[1] = false;
                    }

                }
            }

            for(var i = 0; i < limits.length; i++)
            {
                if(limits[i])
                {
                    this.o.limits[i].o.fadeIn('fast');
                }
                else
                {
                    this.o.limits[i].o.fadeOut('fast');
                }
            }
        }
    }

    /**
     * @param label
     * @param sizes
     * @param prc
     * @returns {ISizes}
     */
    private setPosition(label:any, sizes:any, prc:number):ISizes
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

        label.o.css(cssProps);

        if (sizes.right)
        {
            label.o.css({ left: "auto", right: 0 });
        }

        return sizes;
    }

    public setValue():void
    {
        var value = this.getValue();

        this.inputNode.val(value);

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

        jQuery.each(this.o.pointers,(i:number,pointer:SliderPointer)=>
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
        jQuery.each( this.o.pointers, (i:number,pointer:SliderPointer)=>
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
    public nice(value:any):number
    {
        value = value.toString().replace(/,/gi, ".").replace(/ /gi, "");

        if(jQuery.formatNumber)
        {
            return jQuery.formatNumber(Number(value), this.settings.format || {}).replace( /-/gi, "&minus;" );
        }

        return Number(value);
    }

    public destroy():void
    {
        jQuery.each(this.o.pointers, (i:number,sliderPointer:SliderPointer)=>
        {
            sliderPointer.destroy();
        });

        jQuery.each(this.o.labels, (i:number,element)=>
        {
            element.remove();
        });

        jQuery.each(this.o.limits, (i:number,element)=>
        {
            element.remove();
        });

        this.o.value.remove();

        this.domNode.remove();
    }
}
