/**
 * Created by davidatborresen on 02.02.14.
 */

/// <reference path="../js/jquery.slider.ts" />

jQuery.slider = function (node:HTMLInputElement, settings:ISliderSettings, force:boolean = false):Slider
{
    var jNode = jQuery(node);
    if (!jNode.data("jslider"))
    {
        jNode.data("jslider", new Slider(node, settings));
    }

    return jNode.data("jslider");
};

jQuery.fn.slider = function( action:any, optValue:any):any
{
    var returnValue, args = arguments;

    function isDef( val )
    {
        return val !== undefined;
    }

    function isDefAndNotNull( val )
    {
        return val != null;
    }

    this.each(function()
    {
        var self = jQuery.slider( this, action, optValue);

        // do actions
        if( typeof action == "string" )
        {
            switch( action )
            {
                case "value":
                    if( isDef( args[ 1 ] ) && isDef( args[ 2 ] ) ){
                        var pointers = self.getPointers();
                        if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
                            pointers[0].set( args[ 1 ] );
                            pointers[0].setIndexOver();
                        }

                        if( isDefAndNotNull( pointers[1] ) && isDefAndNotNull( args[2] ) ){
                            pointers[1].set( args[ 2 ] );
                            pointers[1].setIndexOver();
                        }
                    }

                    else if( isDef( args[ 1 ] ) ){
                        var pointers = self.getPointers();
                        if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
                            pointers[0].set( args[ 1 ] );
                            pointers[0].setIndexOver();
                        }
                    }

                    else
                        returnValue = self.getValue();

                    break;

                case "prc":
                    if( isDef( args[ 1 ] ) && isDef( args[ 2 ] ) ){
                        var pointers = self.getPointers();
                        if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
                            pointers[0]._set( args[ 1 ] );
                            pointers[0].setIndexOver();
                        }

                        if( isDefAndNotNull( pointers[1] ) && isDefAndNotNull( args[2] ) ){
                            pointers[1]._set( args[ 2 ] );
                            pointers[1].setIndexOver();
                        }
                    }

                    else if( isDef( args[ 1 ] ) ){
                        var pointers = self.getPointers();
                        if( isDefAndNotNull( pointers[0] ) && isDefAndNotNull( args[1] ) ){
                            pointers[0]._set( args[ 1 ] );
                            pointers[0].setIndexOver();
                        }
                    }

                    else
                        returnValue = self.getPrcValue();

                    break;

                case "calculatedValue":
                    var value = self.getValue().split(";");
                    returnValue = '';
                    for (var i=0; i < value.length; i++)
                    {
                        returnValue += (i > 0 ? ";" : "") + self.nice( value[i] );
                    }
                    break;

                case "disable":
                    self.disableSlider();
                    break;

                case "enable":
                    self.enableSlider();
                    break;

                case "skin":
                    self.setSkin( args[1] );
                    break;
            }
        }

        // return actual object
        else if( !action && !optValue )
        {
            if( !jQuery.isArray( returnValue ) )
            {
                returnValue = [];
            }

            returnValue.push( self );
        }
    });

    // flatten array just with one slider
    if( jQuery.isArray( returnValue ) && returnValue.length == 1 )
    {
        returnValue = returnValue[ 0 ];
    }

    return returnValue || this;
};