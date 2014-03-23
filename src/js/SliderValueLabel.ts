/**
 * Created by davidatborresen on 18.03.14.
 */

/// <reference path="./interfaces.ts" />
/// <reference path="./SliderUXComponent.ts" />
/// <reference path="./SliderTemplate.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

class SliderValueLabel extends SliderUXComponent {

    public template:SliderTemplate;

    private $value:JQuery;

    constructor(template:string, params:Object)
    {
        super();

        this.template = new SliderTemplate(template);
        this.create(params);
        this.$value = this.$el.find('span');
    }

    public setValue(str:string):void
    {
        this.$value.html(str);
    }
}