/**
 * Created by davidatborresen on 02.02.14.
 */

    /// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../js/jquery.sliderDraggable.ts" />
/// <reference path="../js/jquery.slider.ts" />


class SliderPointer extends SliderDraggable {

    public pointer:JQuery;
    public uid:any;
    public parent:Slider;
    public _parent:any;
    public value:any;
    public settings:any;

    /**
     * @param pointer
     * @param id
     * @param constructor
     */
    public onInit(pointer:JQuery, id:any, constructor:Slider):void
    {
        this.uid = id;
        this.parent = constructor;
        this.value = {};
        this.settings = this.parent.settings;
    }

    public onMouseDown():void
    {
        this._parent = {
            offset:this.parent.domNode.offset(),
            width: this.parent.domNode.width()
        };

        this.pointer.addDependClass('hover');
        this.setIndexOver();
    }

    /**
     * @param event
     */
    public onMouseMove(event:MouseEvent):void
    {
        var coords = this.getPageCoords(event);
        this.set(this.calc(coords.x));
    }

    public onMouseUp():void
    {
        if(this.settings.callback && $.isFunction(this.settings.callback))
        {
            this.settings.callback.call(this.parent, this.parent.getValue())
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
        return this.limits(((coords-this._parent.offset.left)*100)/this._parent.width);
    }

    /**
     * @param value
     * @param optOrigin
     */
    public set(value:number, optOrigin = null)
    {
        this.value.origin = this.parent.round(value);

        var prc = this.parent.valueToPrc(value, this);

        if(!optOrigin)
        {
            this.value.origin = this.parent.prcToValue(prc);
        }

        this.value.prc = prc;
        this.pointer.css({left:prc + '%'});
        this.parent.redraw(this);
    }
}