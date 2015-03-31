/**
 * Created by davidatborresen on 18.03.14.
 */

/// <reference path="./interfaces.d.ts" />
/// <reference path="./SliderUXComponent.ts" />
/// <reference path="./SliderTemplate.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

module Slider {

	export class ValueLabel extends Slider.UXComponent {

		public template:Slider.Template;

		private $value:JQuery;

		constructor(template:string, params:Object) {
			super();

			this.template = new Slider.Template(template);
			this.create(params);
			this.$value = this.$el.find('span');
		}

		public setValue(str:string):void {
			this.$value.html(str);
		}
	}
}
