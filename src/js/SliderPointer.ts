/**
 * Created by davidatborresen on 02.02.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./interfaces.ts" />
/// <reference path="./SliderDraggable.ts" />
/// <reference path="./Slider.ts" />

class SliderPointer extends SliderDraggable {

    public uid:number;

    public parent:Slider;

    public parentSizes:any;

    public value:ISliderPointerValue;

    public settings:ISliderSettings;

    public components:{
        label: SliderValueLabel
    };

    /**
     * @param uid
     * @param slider
     */
    constructor(uid:number, slider:Slider)
    {
        this.template = new SliderTemplate(
            '<div class="<%=className%>-pointer"></div>'
        );

        this.components = {
            label:null
        };

        super(uid, slider);
    }

    /**
     * @param pointer
     * @param uid
     * @param slider
     */
    public onInit(uid:number, slider:Slider):void
    {
        this.uid = uid;
        this.parent = slider;
        this.value = {
            prc: null,
            origin: null
        };
        this.settings = this.parent.settings;

        this.create({
            className: Slider.CLASSNAME
        });

        this.parent.$el.append(this.$el);

        this.createValueLabel();

        this.$el.insertAfter(Slider.SELECTOR + '-bg');

        super.onInit(uid, slider);
    }

    private createValueLabel():void
    {
        var template:string;
        var labelParams:Object;
        if(this.uid === Slider.POINTER_TO)
        {
            template = '<div class="<%=className%>-label <%=className%>-label-to"><span><%=to%></span><%=dimension%></div>'
            labelParams = {
                className: Slider.CLASSNAME,
                to: this.settings.to,
                dimension: this.settings.dimension
            };
            this.$el.addClass('pointer-to');
        }
        else
        {
            labelParams = {
                className: Slider.CLASSNAME,
                from: this.settings.from,
                dimension: this.settings.dimension
            };
            template = '<div class="<%=className%>-label"><span><%=from%></span><%=dimension%></div>';
        }

        var label =  new SliderValueLabel(template, labelParams);

        this.parent.$el.append(label.$el);
        this.components.label = label;
    }

    /**
     * @param event
     */
    public onMouseDown(event:HammerEvent):void
    {
        super.onMouseDown(event);

        this.parentSizes = {
            offset:this.parent.$el.offset(),
            width: this.parent.$el.width()
        };

        this.$el.addDependClass('hover');

        this.setIndexOver();
    }

    /**
     * @param event
     */
    public onMouseMove(event:HammerEvent):void
    {
        super.onMouseMove(event);

        this._set(
            this.calc(
                this.getPageCoords(event).x
            )
        );

        this.parent.setValueElementPosition();

        this.parent.redrawLabels(this);
    }

    /**
     * @param minDistance
     * @param another
     * @returns {boolean}
     */
    private isDistanceViolation():boolean
    {
        var distance:IDistance = this.settings.distance;
        var other:SliderPointer = this.getAdjacentPointer();

        if(!(other instanceof SliderPointer) || this.settings.single)
        {
            return false;
        }

        if(this.isMinDistanceViolation(other.get().origin, distance.min))
        {
            return true;
        }

        if(this.isMaxDistanceViolation(other.get().origin, distance.max))
        {
            return true;
        }

        return false;
    }

    /**
     * @param otherOrigin
     * @param max
     * @returns {boolean}
     */
    private isMaxDistanceViolation(otherOrigin:number, max:number):boolean
    {
        if(isNaN(max))
        {
            return false;
        }

        if(this.uid === Slider.POINTER_FROM && otherOrigin + max >= this.value.origin)
        {
            return true;
        }

        if(this.uid === Slider.POINTER_TO && otherOrigin - max <= this.value.origin)
        {
            return true;
        }

        return false;
    }

    /**
     * @param otherOrigin
     * @param min
     * @returns {boolean}
     */
    private isMinDistanceViolation(otherOrigin:number, min:number):boolean
    {
        if(isNaN(min))
        {
            return false;
        }

        if(this.uid === Slider.POINTER_FROM && this.value.origin + min >= otherOrigin)
        {
            return true;
        }

        if(this.uid === Slider.POINTER_TO && this.value.origin - min <= otherOrigin)
        {
            return true;
        }

        return false;
    }

    /**
     * @param event
     */
    public onMouseUp(event:HammerEvent):void
    {
        super.onMouseUp(event);

        if(!this.settings.single && this.isDistanceViolation())
        {
            this.parent.setValueElementPosition();
        }

        if(jQuery.isFunction(this.settings.onStateChange))
        {
            this.settings.onStateChange.call(this.parent, this.parent.getValue())
        }

        this.$el.removeDependClass('hover');
    }

    public setIndexOver():void
    {
        this.parent.setPointerIndex(1);
        this.index(2);
    }

    /**
     * @param i
     */
    public index(i:number):void
    {
        this.css({zIndex: i});
    }

    /**
     * @param x
     * @returns {number}
     */
    public calcLimits(x:number):number
    {
        return this.parent.calcLimits(x, this);
    }

    /**
     * @param coords
     * @returns {number}
     */
    public calc(coords):number
    {
        return this.calcLimits(((coords - this.parentSizes.offset.left) * 100) / this.parentSizes.width);
    }

    /**
     * @param value
     * @param optOrigin
     */
    public set(value:number, optOrigin:boolean = false):void
    {
        this.value.origin = this.parent.round(value);

        this._set(this.parent.valueToPrc(value, this), optOrigin);
    }

    public get():ISliderPointerValue
    {
        return this.value;
    }

    /**
     * @param prc
     * @param optOrigin
     * @private
     */
    public _set(prc:number, optOrigin:boolean =  false):void
    {
        if (!optOrigin)
        {
            this.value.origin = this.parent.prcToValue(prc);
        }

        if (this.isDistanceViolation())
        {
            prc = this.enforceMinMaxDistance();
        }

        this.value.prc = prc;
        this.css({left: prc + '%'});
        this.parent.update();
    }

    /**
     * @returns {number}
     */
    private enforceMinMaxDistance():number
    {
        var another:SliderPointer = this.getAdjacentPointer();
        var distance:IDistance = this.settings.distance;
        var originValue:number = this.get().origin;
        var anotherOriginValue:number = another.get().origin;

        switch(this.uid)
        {
            case Slider.POINTER_FROM:

                if(Boolean(distance.max) && originValue <= (anotherOriginValue - distance.max))
                {
                    this.value.origin = this.clamp(anotherOriginValue - distance.max, this.settings.from, this.settings.to);
                }
                else if(Boolean(distance.min) && (originValue + distance.min) >= anotherOriginValue)
                {
                    this.value.origin = this.clamp(anotherOriginValue - distance.min, this.settings.from, this.settings.to);
                }

                break;

            case Slider.POINTER_TO:

                if(Boolean(distance.max) && originValue >= (anotherOriginValue + distance.max))
                {
                    this.value.origin = this.clamp(anotherOriginValue + distance.max, this.settings.from, this.settings.to);
                }
                else if(Boolean(distance.min) && (originValue - distance.min) <= anotherOriginValue)
                {
                    this.value.origin = this.clamp(anotherOriginValue + distance.min, this.settings.from, this.settings.to);
                }

                break;
        }

        return this.parent.valueToPrc(this.value.origin, this);
    }

    /**
     * @param delta
     * @param min
     * @param max
     * @returns {number}
     */
    private clamp(delta:number,min:number,max:number):number
    {
        if(delta > max)
        {
            return max;
        }
        else if(delta < min)
        {
            return min;
        }

        return delta;
    }

    /**
     * @returns {SliderPointer}
     */
    public getAdjacentPointer():SliderPointer
    {
        return this.parent.getPointers()[1 - this.uid];
    }

    /**
     * @returns {SliderValueLabel}
     */
    public getLabel():SliderValueLabel
    {
        return this.components.label;
    }

    /**
     * @param pointer
     */
    public hasSameOrigin(pointer:SliderPointer):boolean
    {
        return (this.value.prc == pointer.get().prc);
    }
}