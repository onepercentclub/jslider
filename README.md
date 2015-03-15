# jQuery Touch Slider plugin
jQuery Slider is easy to use and multifunctional jQuery plugin.
Note: As of v2.0.0 this library has a dependency of [Hammer.js](http://eightmedia.github.io/hammer.js/)

## Improvements
* Ported to Typescript for better codestyle, and improved inheritance.
* Added grunt task runner for improved and easier build process.

## Build process
You need to have grunt installed to do a manual build of this repo. When grunt is installed and available in the project directory you
only need to run `grunt build` which then will spit out four .js files under dist:
* jquery.slider-bundled.js
* jquery.slider-bundled.min.js
* jquery.slider-standalone.js
* jquery.slider-standalone.min.js

## Tips & Tricks
Since the original implementation has been improved to properly support touch screens, [Hammer.js](http://eightmedia.github.io/hammer.js/) was the library of
choise to do this. While doing tests on this on Windows 8.1 machines and tablets it has been suggested that adding

    .slider {
              -ms-touch-action: none;
          }

to your stylesheet is necessary to prevent IE from navigating back or forth in history when interacting with touch enabled elements
on your project. 

## License
MIT License