beforeEach(function () {
  jasmine.addMatchers({
    toBePlaying: function () {
      return {
        compare: function (actual, expected) {
          var player = actual;

          return {
            pass: player.currentlyPlayingSong === expected && player.isPlaying
          }
        }
      };
    },
    toContainPointer: function(){
        return {
            compare: function(actual, expected) {
                var slider = actual;

                return {
                    pass: slider.getPointers()
                }
            }
        }
    }
  });
});
