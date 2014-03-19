/**
 * Created by davidatborresen on 18.03.14.
 */

/// <reference path="./jquery.sliderBaseLabel.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

class SliderValueLabel extends SliderBaseLabel {

    private $value:JQuery;

    constructor($element:JQuery)
    {
        super($element);

        this.$value = $element.find('span');
    }

    public setValue(str:string):void
    {
        this.$value.html(str);
    }
}