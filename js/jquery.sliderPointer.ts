/**
 * Created by davidatborresen on 02.02.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../js/jquery.sliderDraggable.ts" />
/// <reference path="../js/jquery.slider.ts" />

class SliderPointer extends SliderDraggable {

    public uid:any;
    public parent:Slider;
    public _parent:any;
    public value:any;
    public settings:any;
    private ptr:JQuery;

    /**
     * @param pointer
     * @param id
     * @param slider
     */
    public onInit(pointer:HTMLElement, id:any, slider:Slider):void
    {
        this.uid = id;
        this.parent = slider;
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
        super.onMouseMove(event);
        this._set(this.calc(this.getPageCoords(event).x));
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

    /**
     * @param prc
     * @param optOrigin
     * @private
     */
    private _set(prc:number, optOrigin:boolean =  false):void
    {
        if( !optOrigin )
        {
            this.value.origin = this.parent.prcToValue(prc);
        }

        this.value.prc = prc;
        console.log('setting %O to %d persent', this.pointer, prc, this);
        this.pointer.css({left: prc + '%'});
        this.parent.redraw(this);
    }
}