/**
 * Created by davidatborresen on 02.02.14.
 */
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="./interfaces.d.ts" />
/// <reference path="./SliderDraggable.ts" />
/// <reference path="./Slider.ts" />

module Slider {

	export class Pointer extends Slider.Draggable {
		public uid:number;

		public $scope:Slider.Impl;

		public parentSizes:any;

		public value:ISliderPointerValue;

		public settings:ISliderSettings;

		public components:{
			label: Slider.ValueLabel
		};

		/**
		 * @param config
		 */
		constructor(config:ISliderPointerConfig) {
			super();

			this.initialize(config);

			this.create({
				className: Slider.Impl.CLASSNAME
			});

			this.$scope.$el.append(this.$el);

			this.createValueLabel();

			this.$el.insertAfter(Slider.Impl.SELECTOR + '-bg');

			this.set(MathHelper.valueToPrc(config.value, this), true);
		}

		/**
		 * @param config
		 */
		public initialize(config?:ISliderPointerConfig):void {
			super.initialize(config);

			this.template = new Slider.Template(
				'<div class="<%=className%>-pointer"></div>'
			);
			this.components = {
				label: null
			};
			this.uid = config.id;
			this.$scope = config.$scope;
			this.settings = this.$scope.settings;
			this.value = {
				prc: null,
				origin: null
			};
		}

		private createValueLabel():void {
			var template:string;
			var labelParams:Object;
			if (this.uid === Slider.Impl.POINTER_TO) {

				template = '<div class="<%=className%>-label <%=className%>-label-to"><span><%=to%></span><%=dimension%></div>'
				labelParams = {
					className: Slider.Impl.CLASSNAME,
					to: this.settings.to,
					dimension: this.settings.dimension
				};
				this.$el.addClass('pointer-to');
			}
			else {
				labelParams = {
					className: Slider.Impl.CLASSNAME,
					from: this.settings.from,
					dimension: this.settings.dimension
				};
				template = '<div class="<%=className%>-label <%=className%>-label-from"><span><%=from%></span><%=dimension%></div>';
			}

			var label = new Slider.ValueLabel(template, labelParams);

			this.$scope.$el.append(label.$el);
			this.components.label = label;
		}

		/**
		 * @param event
		 */
		public onMouseDown(event:any):void {
			super.onMouseDown(event);

			this.parentSizes = {
				offset: this.$scope.$el.offset(),
				width: this.$scope.$el.width()
			};

			this.$el.addDependClass('hover');

			this.setIndexOver();
		}

		/**
		 * @param event
		 */
		public onMouseMove(event:any):void {
			super.onMouseMove(event);

			var prc = this.getPrcValueForX(this.getPageCoords(event).x);
			this.set(prc, true);

			this.$scope.setValueElementPosition();

			this.redrawLabels();
		}

		/**
		 * @returns {boolean}
		 */
		private isDistanceViolation():boolean {
			var distance:IDistance = this.settings.distance;
			var other:Slider.Pointer = this.getAdjacentPointer();

			if (!(other instanceof Slider.Pointer) || this.settings.single) {
				return false;
			}

			if (distance && this.isMinDistanceViolation(other.get().origin, distance.min)) {
				return true;
			}
			return distance && this.isMaxDistanceViolation(other.get().origin, distance.max);
		}

		/**
		 * @param otherOrigin
		 * @param max
		 * @returns {boolean}
		 */
		private isMaxDistanceViolation(otherOrigin:number, max:number):boolean {
			if (isNaN(max)) {
				return false;
			}

			if (this.uid === Slider.Impl.POINTER_FROM && otherOrigin + max > this.value.origin) {
				return true;
			}

			return this.uid === Slider.Impl.POINTER_TO && otherOrigin - max < this.value.origin;
		}

		/**
		 * @param otherOrigin
		 * @param min
		 * @returns {boolean}
		 */
		private isMinDistanceViolation(otherOrigin:number, min:number):boolean {
			if (isNaN(min)) {
				return false;
			}

			if (this.uid === Slider.Impl.POINTER_FROM && this.value.origin + min >= otherOrigin) {
				return true;
			}

			return this.uid === Slider.Impl.POINTER_TO && this.value.origin - min <= otherOrigin;
		}

		/**
		 * @param event
		 */
		public onMouseUp(event:any):void {
			super.onMouseUp(event);

			if (!this.settings.single && this.isDistanceViolation()) {
				this.$scope.setValueElementPosition();
			}

			if (jQuery.isFunction(this.settings.onStateChange)) {
				this.$scope.onStateChange(this.$scope.getValue());
			}

			this.$el.removeDependClass('hover');

			this.$scope.setValue();
		}

		public setIndexOver():void {
			this.$scope.setPointerIndex(1);
			this.index(2);
		}

		/**
		 * @param i
		 */
		public index(i:number):void {
			this.css({zIndex: i});
		}

		/**
		 * @param x
		 * @returns {number}
		 */
		private getPrcValueForX(x:number):number {
			return MathHelper.calcLimits(((x - this.parentSizes.offset.left) * 100) / this.parentSizes.width, this);
		}

		/**
		 * @param value
		 * @param isPrc
		 */
		public set(value:number, isPrc:boolean = false):void {
			var roundedValue:number;
			if (isPrc) {
				roundedValue = MathHelper.prcToValue(value, this);
			}
			else {
				roundedValue = MathHelper.round(value, this.settings.step, this.settings.round);
			}

			this.value.origin = MathHelper.clamp(roundedValue, this.settings.from, this.settings.to);
			this.value.prc = MathHelper.valueToPrc(this.value.origin, this);

			if (this.isDistanceViolation()) {
				this.value.prc = this.enforceMinMaxDistance();
			}

			this.css({left: this.value.prc + '%'});

			this.$scope.update();
		}

		/**
		 * @returns {ISliderPointerValue}
		 */
		public get():ISliderPointerValue {
			return this.value;
		}

		/**
		 * @returns {number}
		 */
		private enforceMinMaxDistance():number {
			var another:Slider.Pointer = this.getAdjacentPointer();
			var distance:IDistance = this.settings.distance;
			var originValue:number = this.get().origin;
			var anotherOriginValue:number = another.get().origin;

			switch (this.uid) {
				case Slider.Impl.POINTER_FROM:

					if (Boolean(distance.max) && originValue <= (anotherOriginValue - distance.max)) {
						this.value.origin = MathHelper.clamp(anotherOriginValue - distance.max, this.settings.from, this.settings.to);
					}
					else if (Boolean(distance.min) && (originValue + distance.min) >= anotherOriginValue) {
						this.value.origin = MathHelper.clamp(anotherOriginValue - distance.min, this.settings.from, this.settings.to);
					}

					break;

				case Slider.Impl.POINTER_TO:

					if (Boolean(distance.max) && originValue >= (anotherOriginValue + distance.max)) {
						this.value.origin = MathHelper.clamp(anotherOriginValue + distance.max, this.settings.from, this.settings.to);
					}
					else if (Boolean(distance.min) && (originValue - distance.min) <= anotherOriginValue) {
						this.value.origin = MathHelper.clamp(anotherOriginValue + distance.min, this.settings.from, this.settings.to);
					}

					break;
			}

			return MathHelper.valueToPrc(this.value.origin, this);
		}

		/**
		 * @returns {SliderPointer}
		 */
		public getAdjacentPointer():Slider.Pointer {
			return this.$scope.getPointers()[1 - this.uid];
		}

		/**
		 * @returns {SliderValueLabel}
		 */
		public getLabel():Slider.ValueLabel {
			return this.components.label;
		}

		/**
		 * @param pointer
		 */
		public hasSameOrigin(pointer:Slider.Pointer):boolean {
			return (this.value.prc == pointer.get().prc);
		}

		/**
		 * @returns {void}
		 */
		public redrawLabels():void {
			var label = this.getLabel();

			label.setValue(
				this.$scope.calculate(
					this.get().origin
				)
			);

			var prc:number = this.get().prc;
			var parentSizes:ISliderSizes = this.$scope.sizes;
			var sizes = {
				label: label.outerWidth(),
				right: false,
				border: (prc * parentSizes.domWidth) / 100
			};

			var otherPointer:Slider.Pointer = this.getAdjacentPointer();
			if (otherPointer) {
				var otherLabel:Slider.ValueLabel = otherPointer.getLabel();

				switch (this.uid) {
					case Slider.Impl.POINTER_FROM:
						if (sizes.border + sizes.label / 2 > (otherLabel.offset().left - parentSizes.domOffset.left)) {
							otherLabel.css({visibility: "hidden"});
							otherLabel.setValue(
								this.$scope.calculate(
									otherPointer.get().origin
								)
							);

							label.css({visibility: "visible"});

							prc = (otherPointer.get().prc - prc) / 2 + prc;

							if (otherPointer.get().prc != this.get().prc) {
								label.setValue(
									this.$scope.calculate(this.get().origin)
									+ '&nbsp;&ndash;&nbsp;' +
									this.$scope.calculate(otherPointer.get().origin)
								);

								sizes.label = label.outerWidth();
								sizes.border = (prc * parentSizes.domWidth) / 100;
							}
						}
						else {
							otherLabel.css({visibility: 'visible'});
						}
						break;

					case Slider.Impl.POINTER_TO:
						if (sizes.border - sizes.label / 2 < (otherLabel.offset().left - parentSizes.domOffset.left) + otherLabel.outerWidth()) {
							otherLabel.css({visibility: 'hidden'});
							otherLabel.setValue(
								this.$scope.calculate(
									otherPointer.get().origin
								)
							);

							label.css({visibility: 'visible'});

							prc = (prc - otherPointer.get().prc) / 2 + otherPointer.get().prc;

							if (otherPointer.get().prc != this.get().prc) {
								label.setValue(
									this.$scope.calculate(otherPointer.get().origin)
									+ "&nbsp;&ndash;&nbsp;" +
									this.$scope.calculate(this.get().origin)
								);

								sizes.label = label.outerWidth();
								sizes.border = (prc * parentSizes.domWidth) / 100;
							}
						}
						else {
							otherLabel.css({visibility: 'visible'});
						}
						break;
				}
			}

			this.setPosition(label, sizes, prc);

			if (otherLabel) {
				sizes = {
					label: otherLabel.outerWidth(),
					right: false,
					border: (otherPointer.value.prc * parentSizes.domWidth) / 100
				};

				this.setPosition(otherLabel, sizes, otherPointer.value.prc);
			}
		}

		/**
		 * @param label
		 * @param sizes
		 * @param prc
		 * @returns {ISliderSizes}
		 */
		private setPosition(label:Slider.ValueLabel, sizes:any, prc:number):ISliderSizes {
			sizes.margin = -sizes.label / 2;

			// left limit
			var labelLeft = sizes.border + sizes.margin;
			if (labelLeft < 0) {
				sizes.margin -= labelLeft;
			}

			// right limit
			if (sizes.border + sizes.label / 2 > this.$scope.sizes.domWidth) {
				sizes.margin = 0;
				sizes.right = true;
			}
			else {
				sizes.right = false;
			}

			var cssProps = {
				left: prc + '%',
				marginLeft: sizes.margin,
				right: 'auto'
			};

			label.css(cssProps);

			if (sizes.right) {
				label.css({left: "auto", right: 0});
			}

			return sizes;
		}
	}
}
