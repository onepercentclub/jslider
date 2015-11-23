/**
 * Created by davidatborresen on 02.02.14.
 */

/// <reference path="./interfaces.d.ts" />
/// <reference path="./Slider.ts" />

jQuery.slider = function (node:HTMLInputElement, settings:ISliderSettings, force:boolean = false):Slider.Impl {
	var jNode = jQuery(node);
	if (!jNode.data("jslider") || force) {
		jNode.data("jslider", new Slider.Impl(node, settings));
	}

	return jNode.data("jslider");
};

jQuery.fn.slider = function (action:any, optValue:any):any {
	var returnValue, args = arguments;

	function isDef(val:any):boolean {
		return val !== undefined;
	}

	function isDefAndNotNull(val:any):boolean {
		return isDef(val) && val != null;
	}

	this.each(function () {
		var self = jQuery.slider(<HTMLInputElement>this, action);

		// do actions
		if (typeof action == "string") {
			switch (action) {
				case "value":
					if (isDef(args[1]) && isDef(args[2])) {
						var pointers = self.getPointers();
						if (isDefAndNotNull(pointers[0]) && isDefAndNotNull(args[1])) {
							pointers[0].set(args[1]);
							pointers[0].setIndexOver();
						}

						if (isDefAndNotNull(pointers[1]) && isDefAndNotNull(args[2])) {
							pointers[1].set(args[2]);
							pointers[1].setIndexOver();
						}
					}

					else if (isDef(args[1])) {
						var pointers = self.getPointers();
						if (isDefAndNotNull(pointers[0]) && isDefAndNotNull(args[1])) {
							pointers[0].set(args[1]);
							pointers[0].setIndexOver();
						}
					}

					else
						returnValue = self.getValue();

					break;

				case "prc":
					if (isDef(args[1]) && isDef(args[2])) {
						var pointers = self.getPointers();
						if (isDefAndNotNull(pointers[0]) && isDefAndNotNull(args[1])) {
							pointers[0].set(args[1]);
							pointers[0].setIndexOver();
						}

						if (isDefAndNotNull(pointers[1]) && isDefAndNotNull(args[2])) {
							pointers[1].set(args[2]);
							pointers[1].setIndexOver();
						}
					}

					else if (isDef(args[1])) {
						var pointers = self.getPointers();
						if (isDefAndNotNull(pointers[0]) && isDefAndNotNull(args[1])) {
							pointers[0].set(args[1]);
							pointers[0].setIndexOver();
						}
					}

					else
						returnValue = self.getPrcValue();

					break;

				case "calculatedValue":
					var value = self.getValue().split(";");
					returnValue = '';
					for (var i = 0; i < value.length; i++) {
						returnValue += (i > 0 ? ";" : "") + self.calculate(value[i]);
					}
					break;

				case "disable":
					self.disableSlider();
					break;

				case "enable":
					self.enableSlider();
					break;

				case "skin":
					self.setSkin(args[1]);
					break;
			}
		}

		// return actual object
		else if (!action && !optValue) {
			if (!jQuery.isArray(returnValue)) {
				returnValue = [];
			}

			returnValue.push(self);
		}
	});

	// flatten array just with one slider
	if (jQuery.isArray(returnValue) && returnValue.length == 1) {
		returnValue = returnValue[0];
	}

	return returnValue || this;
};
