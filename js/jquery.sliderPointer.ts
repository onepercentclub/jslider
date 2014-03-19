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
    public _parent:any;
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

        this._parent = {
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
     * @todo overly complex, needs a refactor
     */
    private isDistanceViolation():boolean
    {
        var distance:IDistance = this.settings.distance;
        var another:SliderPointer = this.getAdjacentPointer();

        return (!this.settings.single && this.value && another && another.value)
            &&
            (
                distance.min &&
                (
                    (this.uid === Slider.POINTER_FROM && this.value.origin + distance.min >= another.value.origin)
                    ||
                    (this.uid === Slider.POINTER_TO && this.value.origin - distance.min <= another.value.origin)
                )

                ||

                distance.max &&
                (
                    (this.uid === Slider.POINTER_FROM && another.value.origin + distance.max >= this.value.origin)
                    ||
                    (this.uid === Slider.POINTER_TO && another.value.origin - distance.max <= this.value.origin)
                )
            );
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
        return this.limits(((coords - this._parent.offset.left) * 100) / this._parent.width);
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

        var another:SliderPointer = this.getAdjacentPointer(),
            distance:IDistance = this.settings.distance;

        if (this.isDistanceViolation())
        {
            var originValue:number = this.get().origin;
            var anotherOriginValue:number = another.get().origin;

            switch(this.uid)
            {
                case Slider.POINTER_FROM:

                    if(Boolean(distance.max) && originValue <= (anotherOriginValue - distance.max))
                    {
                        this.value.origin = anotherOriginValue - distance.max;
                    }
                    else if(Boolean(distance.min) && (originValue + distance.min) >= anotherOriginValue)
                    {
                        this.value.origin = this.clamp(anotherOriginValue - distance.min, this.settings.from, this.settings.to);
                    }

                    break;

                case Slider.POINTER_TO:

                    if(Boolean(distance.max) && originValue >= (anotherOriginValue + distance.max))
                    {
                        this.value.origin = anotherOriginValue + distance.max;
                    }
                    else if(Boolean(distance.min) && (originValue - distance.min) <= anotherOriginValue)
                    {
                        this.value.origin = this.clamp(anotherOriginValue + distance.min, this.settings.from, this.settings.to);
                    }

                    break;
            }

            prc = this.parent.valueToPrc(this.value.origin, this);
        }

        this.value.prc = prc;
        this.pointer.css({left: prc + '%'});
        this.parent.update();
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