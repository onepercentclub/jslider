class MathHelper
{
    /**
     * @param delta
     * @param min
     * @param max
     * @returns {number}
     */
    public static clamp(delta:number, min:number, max:number):number
    {
        return Math.min(Math.max(delta, min), max);
    }

    /**
     * @param value
     * @param step
     * @param round
     * @returns {number}
     */
    public static round(value:number, step:number, round:number = 0):number
    {
        value = Math.round(value / step) * step;

        if (round)
        {
            value = Math.round(value * Math.pow(10, round)) / Math.pow(10, round);
        }
        else
        {
            value = Math.round(value);
        }

        return value;
    }

    /**
     *
     * @param prc
     * @param options
     * @returns {number}
     */
    public static prcToValue(prc:number, pointer:SliderPointer):number
    {
        var settings:ISliderSettings = pointer.settings;
        if (settings.hetrogeneity && settings.hetrogeneity.length > 0)
        {
            var heterogeneity:string = settings.hetrogeneity;
            var start:number = 0;
            var from:number = settings.from;
            var value:any;

            for (var i = 0; i <= heterogeneity.length; i++)
            {
                var v:any[];
                if (heterogeneity[i])
                {
                    v = heterogeneity[i].split('/');
                }
                else
                {
                    v = [100, settings.to];
                }

                v[0] = Number(v[0]);
                v[1] = Number(v[1]);

                if (prc >= start && prc <= v[0])
                {
                    value = from + ((prc - start) * (v[1] - from)) / (v[0] - start);
                }

                start = v[0];
                from = v[1];
            }
        }
        else
        {
            value = settings.from + (prc * settings.interval) / 100;
        }

        return MathHelper.round(value, settings.step, settings.round);
    }

    /**
     * @param value
     * @param pointer
     */
    public static valueToPrc(value:any, pointer:SliderPointer):any
    {
        var prc:any;
        var settings:ISliderSettings = pointer.settings;
        if (settings.hetrogeneity && settings.hetrogeneity.length > 0)
        {
            var hetrogeneity:string = settings.hetrogeneity;
            var start:number = 0;
            var from:number = settings.from;
            var v:any;

            for (var i = 0; i <= hetrogeneity.length; i++)
            {
                if (hetrogeneity[i])
                {
                    v = hetrogeneity[i].split('/');
                }
                else
                {
                    v = [100, settings.to];
                }

                v[0] = Number(v[0]);
                v[1] = Number(v[1]);

                if (value >= from && value <= v[1])
                {
                    prc = MathHelper.calcLimits(start + (value - from) * (v[0] - start) / (v[1] - from), pointer);
                }

                start = v[0];
                from = v[1];
            }
        }
        else
        {
            prc = MathHelper.calcLimits((value - settings.from) * 100 / settings.interval, pointer);
        }

        return prc;
    }

    /**
     * Returns percentage delta within configured limits
     * @param delta
     * @param pointer
     * @returns {number}
     */
    public static calcLimits(delta:number, pointer:SliderPointer):number
    {
        var settings:ISliderSettings = pointer.settings;
        if (!settings.smooth)
        {
            var step = settings.step * 100 / (settings.interval);
            delta = Math.round(delta / step) * step;
        }

        var another:SliderPointer = pointer.getAdjacentPointer();
        if (another && pointer.uid && delta < another.get().prc)
        {
            delta = another.get().prc;
        }

        if (another && !pointer.uid && delta > another.get().prc)
        {
            delta = another.get().prc;
        }

        if (delta < 0)
        {
            delta = 0;
        }

        if (delta > 100)
        {
            delta = 100;
        }

        return Math.round(delta * 10) / 10;
    }
}