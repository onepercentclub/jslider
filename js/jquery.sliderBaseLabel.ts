/**
 * Created by davidatborresen on 18.03.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />

interface IOffset {
    top:number;
    left:number;
}
class SliderBaseLabel {

    public $el:JQuery;

    constructor($element:JQuery)
    {
        this.$el = $element;
    }

    public css(cssProps:any):any
    {
        return this.$el.css(cssProps)
    }

    public outerWidth():number
    {
        return this.$el.outerWidth();
    }

    public offset():IOffset
    {
        return this.$el.offset();
    }

    public destroy():void
    {
        this.$el.detach();
        this.$el.off();
        this.$el.remove();
    }
}