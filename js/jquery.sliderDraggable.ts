/**
 * Created by davidatborresen on 31.01.14.
 */

/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="jquery.slider.ts" />

interface ICoordinates {
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

    constructor()
    {
        this.init.apply(this, arguments);
    }

    private init():void
    {
        if(arguments.length > 0)
        {
            this.pointer = $(arguments[0]);
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
            "click": this.supportTouches ? "touchstart" : "click",
            "down": this.supportTouches ? "touchstart" : "mousedown",
            "move": this.supportTouches ? "touchmove" : "mousemove",
            "up"  : this.supportTouches ? "touchend" : "mouseup"
        };

        this.onInit.apply(this, arguments);

        this.setupEvents();
    }

    private setupEvents():void
    {
        this.bindEvent($(document), SliderDraggable.EVENT_MOVE, (event:MouseEvent)=>
        {
            if (this.is.drag)
            {
                event.preventDefault();
                event.stopImmediatePropagation();

                this.mouseMove(event);
            }
        });

        this.bindEvent($(document),SliderDraggable.EVENT_DOWN,(event:MouseEvent)=>
        {
            if(this.is.drag)
            {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        this.bindEvent($(document),SliderDraggable.EVENT_UP,(event:MouseEvent)=>
        {
            this.mouseUp(event);
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_MOVE,(event:MouseEvent)=>
        {
            if(this.is.drag)
            {
                event.preventDefault();
                event.stopPropagation();

                this.mouseMove(event);
            }
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_DOWN, (event:MouseEvent)=>
        {
            this.mouseDown(event);
            return false;
        });

        this.bindEvent(this.pointer, SliderDraggable.EVENT_UP, (event:MouseEvent)=>
        {
            this.mouseUp(event);
        });

        var $anchor = this.pointer.find('a');

            $anchor.on('click',()=>
            {
                this.is.clicked = true;

                if(!this.is.toclick)
                {
                    this.is.toclick = true;
                    return false;
                }

                return true;
            });

            $anchor.on('mousedown',(event:Event)=>
            {
                this.mouseDown(event);
            });
    }

    /**
     * @param event
     * @returns {{x: number, y: number}}
     */
    public getPageCoords(event):ICoordinates
    {
        if(event.targetTouches && event.targetTouches[0])
        {
            return {
                x: event.targetTouches[0].pageX,
                y: event.targetTouches[0].pageY
            };
        }
        else
        {
            return {
                x: event.pageX,
                y: event.pageY
            };
        }
    }

    /**
     * @returns {{left: number, top: number}}
     */
    public getPointerOffset():IOffset
    {
        return this.pointer.offset();
    }

    /**
     * @param element
     * @param eventType
     * @param callback
     */
    private bindEvent(element:JQuery, eventType:string, callback:(event:MouseEvent)=>any):void
    {
        if(this.supportTouches)
        {
            element.get(0).addEventListener(this.events[eventType], callback, false);
        }
        else
        {
            element.on(this.events[eventType], callback);
        }
    }

    /**
     * @param event {Event}
     */
    public mouseDown(event:Event):void
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
                height:Math.max(this.outer.height(),$(document.body).height()),
                overflow:'hidden'
            });
        }

        this.onMouseDown(event);
    }

    /**
     * @param event {MouseEvent}
     */
    public mouseMove(event:MouseEvent):void
    {
        this.is.toclick = false;
        var coords = this.getPageCoords(event);
        this.onMouseMove(event, coords.x - this.cursorX, coords.y - this.cursorY);
    }

    /**
     * @param event {MouseEvent}
     */
    public mouseUp(event:MouseEvent):void
    {
        if(!this.is.drag)
        {
            return;
        }

        this.is.drag = false;

        if(this.outer.length > 0 && (navigator.userAgent.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/i.test(navigator.userAgent)))
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
        this.pointer.css({ position: "absolute" });
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
}