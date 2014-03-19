/**
 * Created by davidatborresen on 02.02.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../js/jquery.sliderDraggable.ts" />
/// <reference path="../js/jquery.slider.ts" />

interface ISliderPointerValue {
    prc:number;
    origin:number;
}

class SliderPointer extends SliderDraggable {

    public uid:any;
    public parent:Slider;
    public parentSizes:any;
    public value:ISliderPointerValue;
    public settings:ISliderSettings;

    /**
     * @param pointer
     * @param id
     * @param slider
     */
    public onInit(pointer:HTMLElement, id:any, slider:Slider):void
    {
        super.onInit(pointer, id, slider);

        this.uid = id;
        this.parent = slider;
        this.value = {
            prc: null,
            origin: null
        };
        this.settings = this.parent.settings;
    }

    /**
     * @param event
     */
    public onMouseDown(event:Event):void
    {
        super.onMouseDown(event);

        this.parentSizes = {
            offset:this.parent.$el.offset(),
            width: this.parent.$el.width()
        };

        this.pointer.addDependClass('hover');

        this.setIndexOver();
    }

    /**
     * @param event
     */
    public onMouseMove(event:JQueryEventObject):void
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
    public onMouseUp(event:Event):void
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

        this.pointer.removeDependClass('hover');
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
        this.pointer.css({zIndex: i});
    }

    /**
     * @param x
     * @returns {number}
     */
    public limits(x:number):number
    {
        return this.parent.limits(x, this);
    }

    /**
     * @param coords
     * @returns {number}
     */
    public calc(coords):number
    {
        return this.limits(((coords - this.parentSizes.offset.left) * 100) / this.parentSizes.width);
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
    private _set(prc:number, optOrigin:boolean =  false):void
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
        this.pointer.css({left: prc + '%'});
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
     * @param pointer
     */
    public hasSameOrigin(pointer:SliderPointer):boolean
    {
        return (this.value.prc == pointer.get().prc);
    }
}