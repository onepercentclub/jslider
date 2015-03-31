/**
 * Created by davidatborresen on 18.03.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./interfaces.d.ts" />
/// <reference path="./SliderTemplate.ts" />

module Slider {

	export class UXComponent {

		public $el:JQuery;
		public template:Slider.Template;
		public components:Object;

		private initialized:boolean = false;

		/**
		 * @param templateParams
		 * @returns {UXComponent}
		 */
		public create(templateParams:Object = {}):UXComponent {
			if (!this.template) {
				throw 'No template is defined';
			}

			if (this.isInitialized()) {
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
		public css(cssProps:any):any {
			this.getAnimationFrame(()=> {
				this.$el.css(cssProps);
			});
			return this.$el;
		}

		/**
		 * @returns {number}
		 */
		public outerWidth():number {
			return this.$el.outerWidth();
		}

		/**
		 * @returns {{left: number, top: number}}
		 */
		public offset():IOffset {
			return this.$el.offset();
		}

		public destroy():void {
			this.$el.detach();
			this.$el.off();
			this.$el.remove();
		}

		/**
		 * @returns {boolean}
		 */
		public isInitialized():boolean {
			return this.initialized;
		}

		/**
		 * @param callback
		 */
		public getAnimationFrame(callback:()=>any):void {
			var animationFrame = (function () {
				return window.requestAnimationFrame ||
					window['webkitRequestAnimationFrame'] ||
					window['mozRequestAnimationFrame'] ||
					function (callback) {
						window.setTimeout(callback, 1000 / 60);
					};
			})();

			animationFrame(callback);

		}
	}
}