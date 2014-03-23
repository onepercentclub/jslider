/**
 * Created by davidatborresen on 19.03.14.
 */

/// <reference path="./SliderPointer.ts" />
/// <reference path="./SliderTemplate.ts" />
/// <reference path="./SliderValueLabel.ts" />
/// <reference path="./SliderLimitLabel.ts" />
/// <reference path="./SliderUXComponent.ts" />
/// <reference path="./Slider.ts" />

interface IOffset {
    top:number;
    left:number;
}

interface IDistance {
    min:number;
    max:number;
}

interface ISliderSettings {
    to?:number;
    from?:number;
    interval?:number;
    value?:string;
    calculate?:() => string;
    onStateChange?:() => boolean;
    dimension?:string;
    skin?:string;
    limits?:any;
    single?:boolean;
    scale?:string;
    hetrogeneity?:string;
    step?:number;
    round?:number;
    smooth?:boolean;
    distance?:IDistance;
    format?:Object;
    maxDistance?:number;
}

interface ISliderSizes {
    domWidth:number;
    domOffset:IOffset;
}

interface ISliderComponents
{
    [name:string]:SliderUXComponent[];
    /*value?:JQuery;
    labels?: SliderValueLabel[];
    limits?: SliderLimitLabel[];
    pointers?: SliderPointer[];*/
}

interface ISliderPointerValue {
    prc:number;
    origin:number;
}

interface ICoordinates
{
    x:number;
    y:number;
}

interface IInteractionType
{
    drag:boolean;
    clicked:boolean;
    toclick:boolean;
    mouseup:boolean;
}

interface JQuery
{
    slider(node:HTMLInputElement, settings:ISliderSettings, force:boolean):Slider;
}

interface JQueryStatic
{
    slider(node:HTMLInputElement, settings:ISliderSettings, force:boolean):Slider;
}

