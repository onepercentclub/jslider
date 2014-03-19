/**
 * Created by davidatborresen on 18.03.14.
 */
/// <reference path="./jquery.sliderBaseLabel.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

class SliderLimitLabel extends SliderBaseLabel {

    constructor($element:JQuery)
    {
        super($element);
    }

    public fadeIn(duration:any):JQuery
    {
        return this.$el.fadeIn(duration);
    }

    public fadeOut(duration:any):JQuery
    {
        return this.$el.fadeIn(duration);
    }
}