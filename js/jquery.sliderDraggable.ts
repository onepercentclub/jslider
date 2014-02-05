/**
 * Created by davidatborresen on 31.01.14.
 */

/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="jquery.slider.ts" />

interface ICoordinates
{
    x:number;
    y:number;
}

interface IInteractionType
{
    drag:boolean;
    clicked:boolean;
    toclick:boolean;
    mouseup:boolean;
}

interface IOffset
{
    top:number;
    left:number;
}

class SliderDraggable {

    public static EVENT_NAMESPACE:string = '.slider.draggable';
    public static EVENT_CLICK:string = 'click';
    public static EVENT_UP:string = 'up';
    public static EVENT_MOVE:string = 'move';
    public static EVENT_DOWN:string = 'down';

    public pointer:JQuery;
    private outer:JQuery;
    private defaultIs:IInteractionType = {
        drag: false,
        clicked: false,
        toclick: true,
        mouseup: false
    };
    private is:IInteractionType;
    private supportTouches:boolean;
    private events:Object;
    private cursorX:number;
    private cursorY:number;
    private d:Object;

    /**
     * @param pointer {HTMLElement}
     * @param uid {number}
     * @param slider {Slider}
     */
    constructor(pointer:HTMLElement, uid:any, slider:Slider)
    {
        this.init(pointer);
        this.onInit(pointer, uid, slider)
    }

    /**
     * @param pointer {HTMLElement}
     */
    private init(pointer:HTMLElement):void
    {
        if(arguments.length > 0)
        {
            this.pointer = $(pointer);
            this.outer = $('.draggable-outer');
        }

        var offset:IOffset = this.getPointerOffset();

        this.is = $.extend(this.is, this.defaultIs);

        this.d = {
            left: offset.left,
            top: offset.top,
            width: this.pointer.width(),
            height: this.pointer.height()
        };

        this.supportTouches = ('ontouchend' in document);

        this.events = {
            'down': this.supportTouches ? 'touchstart' : 'mousedown',
            'move': this.supportTouches ? 'touchmove' : 'mousemove',
            'up'  : this.supportTouches ? 'touchend' : 'mouseup',
            'click': this.supportTouches ? 'touchstart' : 'click'
        };

        this.setupEvents();
    }

    private setupEvents():void
    {
        this.bindEvent($(document), SliderDraggable.EVENT_MOVE, (event:JQueryEventObject)=>
        {
            if (this.is.drag)
            {
                event.preventDefault();
                event.stopImmediatePropagation();

                this.mouseMove(event);
            }
        });

        this.bindEvent($(document),SliderDraggable.EVENT_DOWN,(event:JQueryEventObject)=>
        {
            if(this.is.drag)
            {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        this.bindEvent($(document),SliderDraggable.EVENT_UP,(event:JQueryEventObject)=>
        {
            this.mouseUp(event);
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_MOVE,(event:JQueryEventObject)=>
        {
            if(this.is.drag)
            {
                event.preventDefault();
                event.stopPropagation();

                this.mouseMove(event);
            }
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_DOWN, (event:JQueryEventObject)=>
        {
            this.mouseDown(event);
            return false;
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_UP, (event:JQueryEventObject)=>
        {
            this.mouseUp(event);
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_CLICK,(event:JQueryEventObject)=>
        {
            this.is.clicked = true;

            if(!this.is.toclick)
            {
                this.is.toclick = true;
                return false;
            }

            return true;
        });
    }

    /**
     * @param event {JQueryEventObject}
     * @returns {{x: number, y: number}}
     */
    public getPageCoords(event:JQueryEventObject):ICoordinates
    {
        var originalEvent = (event.originalEvent instanceof TouchEvent) ? event.originalEvent : event;

        if('targetTouches' in originalEvent && originalEvent.targetTouches.length == 1)
        {
            return {
                x: originalEvent.targetTouches[0].pageX,
                y: originalEvent.targetTouches[0].pageY
            };
        }

        return {
            x: originalEvent.pageX,
            y: originalEvent.pageY
        };
    }

    /**
     * @returns {{left: number, top: number}}
     */
    public getPointerOffset():IOffset
    {
        return this.pointer.offset();
    }

    private unbindAllEvents():void
    {
        for(var eventType in this.events)
        {
            $(document).off(this.events[eventType] + SliderDraggable.EVENT_NAMESPACE);
            this.pointer.off(this.events[eventType] + SliderDraggable.EVENT_NAMESPACE);
        }
    }

    /**
     * @param element
     * @param eventType
     * @param callback
     */
    private bindEvent(element:JQuery, eventType:string, callback:(event:JQueryEventObject)=>void):void
    {
        element.on(this.events[eventType] + SliderDraggable.EVENT_NAMESPACE, callback);
    }

    /**
     * @param event {Event}
     */
    public mouseDown(event:JQueryEventObject):void
    {
        this.is.drag = true;
        this.is.mouseup = this.is.clicked = false;

        var offset:IOffset = this.getPointerOffset(),
            coords:ICoordinates = this.getPageCoords(event);

        this.cursorX = coords.x - offset.left;
        this.cursorY = coords.y - offset.top;

        this.d = $.extend(this.d,{
            left:offset.left,
            top:offset.top,
            width:this.pointer.width(),
            height:this.pointer.height()
        });


        if(this.outer.length > 0)
        {
            this.outer.css({
                height: Math.max(this.outer.height(), $(document.body).height()),
                overflow: 'hidden'
            });
        }

        this.onMouseDown(event);
    }

    /**
     * @param event {MouseEvent}
     */
    public mouseMove(event:JQueryEventObject):void
    {
        this.is.toclick = false;
        var coords = this.getPageCoords(event);
        this.onMouseMove(event, coords.x - this.cursorX, coords.y - this.cursorY);
    }

    /**
     * @param event {MouseEvent}
     */
    public mouseUp(event:JQueryEventObject):void
    {
        if(!this.is.drag)
        {
            return;
        }

        this.is.drag = false;

        if(this.outer.length > 0 && (navigator.userAgent.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/i.test(navigator.userAgent)))
        {
            this.outer.css({overflow:'hidden'});
        }
        else
        {
            this.outer.css({overflow:'visible'});
        }

        this.onMouseUp(event);
    }

    /**
     * @param pointer
     * @param id
     * @param constructor
     */
    public onInit(pointer:HTMLElement,id:number,constructor:Slider):void
    {}

    /**
     * @param event {MouseEvent}
     */
    public onMouseDown(event:Event):void
    {
        this.pointer.css({ position: 'absolute' });
    }

    /**
     * @param event {MouseEvent}
     * @param x {number}
     * @param y {number}
     */
    public onMouseMove(event:Event, x:number = null, y:number = null):void
    {}

    /**
     * @param event {MouseEvent}
     */
    public onMouseUp(event:Event):void
    {}

    public destroy():void
    {
        this.unbindAllEvents();
        this.pointer.remove();
    }
}