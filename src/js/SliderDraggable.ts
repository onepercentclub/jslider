/**
 * Created by davidatborresen on 31.01.14.
 */

/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../definitions/hammer/hammerjs.d.ts" />
/// <reference path="./interfaces.ts" />
/// <reference path="./Slider.ts" />
/// <reference path="./SliderUXComponent.ts" />

class SliderDraggable extends SliderUXComponent {

    public static EVENT_NAMESPACE:string = '.sliderDraggable';
    public static EVENT_CLICK:string = 'click';
    public static EVENT_UP:string = 'up';
    public static EVENT_MOVE:string = 'move';
    public static EVENT_DOWN:string = 'down';

    private outer:JQuery;
    private defaultIs:IInteractionType = {
        drag: false,
        clicked: false,
        toclick: true,
        mouseup: false
    };
    private is:IInteractionType;
    private events:Object;
    private cursorX:number;
    private cursorY:number;
    private d:Object;

    /**
     * @param uid {number}
     * @param slider {Slider}
     */
    constructor(uid:number, slider:Slider)
    {
        super();

        this.onInit(uid, slider);
    }

    private setupEvents():void
    {
        this.bind(jQuery(document), SliderDraggable.EVENT_MOVE, (event:HammerEvent)=>
        {
            if (this.is.drag)
            {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();

                this.mouseMove(event);
            }
        });

        this.bind(jQuery(document), SliderDraggable.EVENT_DOWN, (event:HammerEvent)=>
        {
            if(this.is.drag)
            {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();
            }
        });

        this.bind(this.$el, SliderDraggable.EVENT_MOVE, (event:HammerEvent)=>
        {
            if(this.is.drag)
            {
                event.gesture.preventDefault();
                event.gesture.stopPropagation();

                this.mouseMove(event);
            }
        });

        this.bind(this.$el, SliderDraggable.EVENT_DOWN, (event:HammerEvent)=>
        {
            this.mouseDown(event);
            return false;
        });

        this.bind(this.$el, SliderDraggable.EVENT_UP, (event:HammerEvent)=>
        {
            this.mouseUp(event);
        });

        this.bind(this.$el, SliderDraggable.EVENT_CLICK, ()=>
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
    public getPageCoords(event:HammerEvent):ICoordinates
    {
        var touchList = event.gesture.touches;
        return {
            x: touchList[0].pageX,
            y: touchList[0].pageY
        };
    }

    /**
     * @returns {{left: number, top: number}}
     */
    public getPointerOffset():IOffset
    {
        return this.$el.offset();
    }

    /**
     * @todo find out why event namespace doesnt work
     */
    private unbind():void
    {
        for(var eventType in this.events)
        {
            var namespacedEvent:string = this.events[eventType]; // + SliderDraggable.EVENT_NAMESPACE
            jQuery(document).hammer().off(namespacedEvent);
            this.$el.hammer().off(namespacedEvent);
        }
    }

    public destroy():void
    {
        this.unbind();
        super.destroy();
    }

    /**
     * @param element
     * @param eventType
     * @param callback
     * @todo find out why event namespace doesnt work
     */
    private bind(element:JQuery, eventType:string, callback:(event:HammerEvent)=>void):void
    {
        var namespacedEvent:string = this.events[eventType]; // + SliderDraggable.EVENT_NAMESPACE

        Hammer(element.get(0)).on(namespacedEvent, callback);
    }

    /**
     * @param event {Event}
     */
    public mouseDown(event:HammerEvent):void
    {
        this.is.drag = true;
        this.is.mouseup = this.is.clicked = false;

        var offset:IOffset = this.getPointerOffset(),
            coords:ICoordinates = this.getPageCoords(event);

        this.cursorX = coords.x - offset.left;
        this.cursorY = coords.y - offset.top;

        this.d = jQuery.extend(this.d,{
            left:offset.left,
            top:offset.top,
            width:this.$el.width(),
            height:this.$el.height()
        });


        if(this.outer.length > 0)
        {
            this.outer.css({
                height: Math.max(this.outer.height(), jQuery(document.body).height()),
                overflow: 'hidden'
            });
        }

        this.onMouseDown(event);
    }

    /**
     * @param event {MouseEvent}
     */
    public mouseMove(event:HammerEvent):void
    {
        this.is.toclick = false;
        var coords = this.getPageCoords(event);
        this.onMouseMove(event, coords.x - this.cursorX, coords.y - this.cursorY);
    }

    /**
     * @param event {MouseEvent}
     */
    public mouseUp(event:HammerEvent):void
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
     * @param id
     * @param constructor
     */
    public onInit(id:number, constructor:Slider):void
    {
        this.outer = jQuery('.draggable-outer');

        var offset:IOffset = this.getPointerOffset();

        this.is = jQuery.extend(this.is, this.defaultIs);

        this.d = {
            left: offset.left,
            top: offset.top,
            width: this.$el.width(),
            height: this.$el.height()
        };

        this.events = {
            down: 'touch',
            move: 'drag',
            up  : 'release',
            click: 'tap'
        };

        this.setupEvents();
    }

    /**
     * @param event {MouseEvent}
     */
    public onMouseDown(event:HammerEvent):void
    {
        this.css({ position: 'absolute' });
    }

    /**
     * @param event {MouseEvent}
     * @param x {number}
     * @param y {number}
     */
    public onMouseMove(event:HammerEvent, x:number = null, y:number = null):void
    {}

    /**
     * @param event {MouseEvent}
     */
    public onMouseUp(event:HammerEvent):void
    {}
}