/**
 * Created by davidatborresen on 18.03.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="./SliderUXComponent.ts" />
/// <reference path="./SliderTemplate.ts" />
module Slider {
	export class LimitLabel extends Slider.UXComponent {

		public template:Slider.Template = new Slider.Template(
			'<div class="<%=className%>-value"><span></span><%=dimension%></div>'
		);

		constructor(template:string, params:Object) {
			super();
			this.template = new Slider.Template(template);
			this.create(params);
		}

		public fadeIn(duration:any):JQuery {
			return this.$el.fadeIn(duration);
		}

		public fadeOut(duration:any):JQuery {
			return this.$el.fadeOut(duration);
		}
	}
}