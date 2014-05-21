/**
 * Created by davidatborresen on 18.03.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./interfaces.ts" />
/// <reference path="./SliderTemplate.ts" />

class SliderUXComponent {

    public $el:JQuery;
    public template:SliderTemplate;
    public components:Object;

    private initialized:boolean = false;

    /**
     * @param templateParams
     * @returns {SliderUXComponent}
     */
    public create(templateParams:Object = {}):SliderUXComponent
    {
        if(!this.template)
        {
            throw 'No template is defined';
        }

        if(this.isInitialized())
        {
           return this;
        }

        this.$el = jQuery(this.template.render(templateParams));

        this.initialized = true;

        return this;
    }

    /**
     * @param cssProps
     * @returns {string|JQuery}
     */
    public css(cssProps:any):any
    {
        return this.$el.css(cssProps)
    }

    /**
     * @returns {number}
     */
    public outerWidth():number
    {
        return this.$el.outerWidth();
    }

    /**
     * @returns {{left: number, top: number}}
     */
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

    /**
     * @returns {boolean}
     */
    public isInitialized():boolean
    {
        return this.initialized;
    }
}