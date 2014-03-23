/**
 * Created by davidatborresen on 18.03.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./interfaces.ts" />
/// <reference path="./SliderUXComponent.ts" />
/// <reference path="./SliderTemplate.ts" />

class SliderLimitLabel extends SliderUXComponent {

    public template:SliderTemplate = new SliderTemplate(
        '<div class="<%=className%>-value"><span></span><%=dimension%></div>'
    );

    constructor(template:string, params:Object)
    {
        super();
        this.template = new SliderTemplate(template);
        this.create(params);
    }

    public fadeIn(duration:any):JQuery
    {
        return this.$el.fadeIn(duration);
    }

    public fadeOut(duration:any):JQuery
    {
        return this.$el.fadeOut(duration);
    }
}