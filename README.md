# jQuery Slider plugin
jQuery Slider is easy to use and multifunctional jQuery plugin.


## Bugs / Pull requests
Original implementation by [Egor Khmelev](https://github.com/egorkhmelev)

Maintained by [SalesSeek Limited](https://github.com/SalesSeek/)

Ported to Typescript for better codestyle, and improved inheritance by [David A T Børresen](https://github.com/abdavid/)

Added grunt task runner for improved and easier build process by [David A T Børresen](https://github.com/abdavid/)

## Build proccess
You need to have grunt installed to a manual build of this repo. When grunt is installed and available in the project directory you
only need to run `grunt build` which then will spit out two .js files under dist. One is compressed, the other is not.

## Tips & Tricks
Since the original implementation has been improved to properly support touch screens, [Hammer.js](http://eightmedia.github.io/hammer.js/) was the library of
choise to do this. While doing tests on this on Windows 8.1 machines and tablets it has been suggested that adding

    html {
              -ms-touch-action: none;
          }

to your stylesheet is necessary to prevent IE from navigating back or forth in history when interacting with touch enabled elements
on your project. 

## License
(MIT License) — Copyright &copy Egor Khmelev;