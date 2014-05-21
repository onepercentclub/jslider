/// <reference path="../definitions/jasmine/jasmine.d.ts" />
/// <reference path="../definitions/jasmine-matchers/jasmine-matchers.d.ts" />
/// <reference path="../definitions/hammerjs/hammerjs.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../js/Slider.ts" />
describe('Slider', function () {
    function createSlider(value, settings) {
        var container = document.querySelector('.shadowDomRoot');
        var inputNode = document.createElement('input');
        inputNode.value = value;
        inputNode.type = 'text';

        $(container).append(inputNode);

        return new Slider(inputNode, settings);
    }

    describe('Two pointer configuration', function () {
        it('should add two pointers', function () {
            var slider = createSlider('2;6', {
                from: 0,
                to: 10,
                step: 1
            });

            var pointers = slider.getPointers();

            expect(pointers.length).toEqual(2);
        });

        it('should update value on input', function () {
            var slider = createSlider('2;6', {
                from: 0,
                to: 10,
                step: 1
            });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];
            var pointerTo = pointers[1];

            pointerFrom.set(1);
            pointerTo.set(10);

            expect(slider.$input.val()).toEqual('1;10');
        });

        it('should be able to update values on the pointers', function () {
            var slider = createSlider('2;6', {
                from: 0,
                to: 10,
                step: 1
            });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];
            var pointerTo = pointers[1];

            /** setting regular values */
            pointerFrom.set(0);
            expect(pointerFrom.get().origin).toEqual(0);

            pointerTo.set(10);
            expect(pointerTo.get().origin).toEqual(10);

            pointerFrom.set(5);
            expect(pointerFrom.get().origin).toEqual(5);

            pointerTo.set(5);
            expect(pointerTo.get().origin).toEqual(5);

            /** setting percent values */
            pointerFrom._set(0);
            expect(pointerFrom.get().origin).toEqual(0);

            pointerTo._set(100);
            expect(pointerTo.get().origin).toEqual(10);

            pointerFrom._set(50);
            expect(pointerFrom.get().origin).toEqual(5);

            pointerTo._set(50);
            expect(pointerTo.get().origin).toEqual(5);
        });

        it('should stay within boundaries defined with from/to', function () {
            var slider = createSlider('2;6', {
                from: 0,
                to: 10,
                step: 1
            });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];
            var pointerTo = pointers[1];

            pointerFrom.set(-2);
            pointerTo.set(13);

            expect(pointerFrom.get().origin).toEqual(0);
            expect(pointerTo.get().origin).toEqual(10);
        });

        it('should add value bar element', function () {
            var slider = createSlider('2;5', { from: 0, to: 10, step: 1 });

            expect(slider.$value).not.toBeUndefined();
        });

        it('should display value bar element to be within pointer boundaries', function () {
            var slider = createSlider('2;5', { from: 0, to: 10, step: 1 });
            var pointers = slider.getPointers();
            var fromPercent = pointers[0].get().prc;
            var toPercent = pointers[1].get().prc;
            var barLeft = parseInt(slider.$value.get(0).style.left, 10);
            var barWidth = parseInt(slider.$value.get(0).style.width, 10);

            expect(barLeft).toEqual(fromPercent);
            expect(barWidth).toEqual(toPercent - fromPercent);
        });

        xit('should hide limit labels when pointer(s) overlaps', function () {
            var slider = createSlider('2;5', { from: 0, to: 10, step: 1 });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];
            var pointerTo = pointers[1];

            var limits = slider.getLimits();
            var limitFrom = limits[0];
            var limitTo = limits[1];

            jQuery.fx.off = true;

            pointerFrom._set(0);
            pointerTo._set(100);

            expect(limitFrom.$el.is(':visible')).toBe(false);
            expect(limitTo.$el.is(':visible')).toBe(false);
        });

        it('should show limit labels when pointer(s) do not overlap', function () {
            var slider = createSlider('2;5', { from: 0, to: 10, step: 1 });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];
            var pointerTo = pointers[1];

            var limits = slider.getLimits();
            var limitFrom = limits[0];
            var limitTo = limits[1];

            pointerFrom._set(10);
            expect(limitFrom.$el.is(':visible')).toBe(true);

            pointerTo._set(90);
            expect(limitTo.$el.is(':visible')).toBe(true);
        });
    });

    describe('Distance violation configuration', function () {
        it('should not violate mininum distance', function () {
            var slider = createSlider('2;8', { from: 0, to: 10, step: 1, distance: { min: 3 } });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];

            pointerFrom.set(8);

            expect(pointerFrom.get().origin).toEqual(5);
        });

        it('should not violate maximum distance', function () {
            var slider = createSlider('6;8', { from: 0, to: 10, step: 1, distance: { max: 3 } });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];

            pointerFrom.set(2);

            expect(pointerFrom.get().origin).toEqual(5);
        });

        it('should not violate maximum and minimum distance', function () {
            var slider = createSlider('2;8', { from: 0, to: 10, step: 1, distance: { max: 6, min: 2 } });
            var pointers = slider.getPointers();
            var pointerFrom = pointers[0];

            pointerFrom.set(8);
            expect(pointerFrom.get().origin).toEqual(6);

            pointerFrom.set(0);
            expect(pointerFrom.get().origin).toEqual(2);
        });
    });

    describe('Dimension configuration', function () {
        it('should show dimension', function () {
            var dimension = ' $';
            var slider = createSlider('2;8', { from: 0, to: 10, step: 1, dimension: dimension });
            var pointers = slider.getPointers();
            var limits = slider.getLimits();
            var pointerFrom = pointers[0];
            var limitFrom = limits[0];
            var pointerTo = pointers[1];
            var limitTo = limits[1];

            expect(pointerFrom.getLabel().$el.text()).toEqual('2' + dimension);
            expect(pointerTo.getLabel().$el.text()).toEqual('8' + dimension);

            expect(limitFrom.$el.text()).toEqual('0' + dimension);
            expect(limitTo.$el.text()).toEqual('10' + dimension);
        });
    });

    describe('Hetrogeneity configuration', function () {
        xit('should add correct scale', function () {
        });
    });

    describe('One pointer configuration', function () {
        it('should add one pointer', function () {
            var slider = createSlider('2', {
                from: 0,
                to: 10,
                step: 1
            });
            expect(slider.getPointers().length).toEqual(1);
        });

        it('should update value on input', function () {
            var slider = createSlider('6', {
                from: 0,
                to: 10,
                step: 1
            });
            var pointers = slider.getPointers();
            var pointer = pointers[0];

            pointer.set(1);

            expect(slider.$input.val()).toEqual('1');
        });

        it('should be able to update value on pointer', function () {
            var slider = createSlider('2', {
                from: 0,
                to: 10,
                step: 1
            });
            var pointers = slider.getPointers();
            var pointer = pointers[0];

            /** setting regular values */
            pointer.set(0);
            expect(pointer.get().origin).toEqual(0);

            pointer.set(5);
            expect(pointer.get().origin).toEqual(5);

            pointer.set(10);
            expect(pointer.get().origin).toEqual(10);

            /** setting percent values */
            pointer._set(0);
            expect(pointer.get().origin).toEqual(0);

            pointer._set(50);
            expect(pointer.get().origin).toEqual(5);

            pointer._set(100);
            expect(pointer.get().origin).toEqual(10);
        });

        it('should not add value bar element', function () {
            var slider = createSlider('2', { from: 0, to: 10, step: 1 });

            expect(slider.$value).toBeUndefined();
        });
        /*it('should be able to move the one pointer', function()
        {
        });
        
        it('should add value bar', function()
        {
        });*/
    });
});
//# sourceMappingURL=SliderTest.js.map
