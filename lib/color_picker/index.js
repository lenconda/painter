;(function(global, undefined) {
  var picker = (function() {
    var mousedown = false;
    var currentSlider = -1;
    var beginX = 0;
    var positionX = [0, 0, 0, 0];
    var beginClientX = 0;
    var sliderLong = 0;

    return function(targetElementID, triggers, callback) {
      var targetElement = document.getElementById(targetElementID.slice(1));
      if (!!!targetElement) { return false; }

      var pickerElement = document.createElement('div');
      pickerElement.classList.add('color-picker__wrapper');
      pickerElement.classList.add('hidden');

      for (var i = 0; i < 4; i += 1) {
        var sliderElement = document.createElement('div');
        sliderElement.classList.add('slider');
        sliderElement.appendChild(document.createElement('span'));
        pickerElement.appendChild(sliderElement);
      }

      targetElement.addEventListener('click', function(event) {
        if (event.target !== this) {
          var filteredTriggers = triggers.filter(function(value) {
            return value === event.target
          });
          if (!!!filteredTriggers.length) { return false; }
        }

        if (pickerElement.classList.contains('hidden')) {
          pickerElement.classList.remove('fade-slide-out');
          pickerElement.classList.remove('hidden');
          pickerElement.classList.add('fade-slide-in');
        } else {
          pickerElement.classList.remove('fade-slide-in');
          pickerElement.classList.add('fade-slide-out');
          setTimeout(function() {
            pickerElement.classList.add('hidden');
          }, 200);
        }
      });

      targetElement.appendChild(pickerElement);

      pickerElement.childNodes.forEach(function(slider, index) {
        var sliderThumb = slider.childNodes[0];
        slider.addEventListener('mousedown', function(event) {
          if (event.button === 0) {
            mousedown = true;
            beginX = event.offsetX;
            positionX[index] = event.offsetX;
            sliderLong = parseInt(slider.clientWidth, 10);
            beginClientX = event.clientX;
            currentSlider = index;
            sliderThumb.style.left = (event.offsetX >= 0 && event.offsetX <= slider.clientWidth) && positionX[index] + 'px';
            callback && callback(positionX.map(function(value, index) {
              if (index === 3) {
                return Math.round(value / slider.clientWidth * 100) / 100;
              } else {
                return parseInt(value / slider.clientWidth * 255, 10);
              }
            }));
          }
        });

        document.addEventListener('mousemove', function(event) {
          if (mousedown && currentSlider === index) {
            var moveX = event.clientX - beginClientX;
            positionX[index] = ((beginX + moveX > sliderLong) ? sliderLong : (beginX + moveX < 0) ? 0 : beginX + moveX);
            sliderThumb.style.left = (event.offsetX >= 0 && event.offsetX <= slider.clientWidth) && positionX[index] + 'px';
            callback && callback(positionX.map(function(value, index) {
              if (index === 3) {
                return Math.round(value / slider.clientWidth * 100) / 100;
              } else {
                return parseInt(value / slider.clientWidth * 255, 10);
              }
            }));
          }
        });

        document.addEventListener('mouseup', function(event) {
          if (event.button === 0 && currentSlider === index) {
            mousedown = false;
            currentSlider = -1;
            callback && callback(positionX.map(function(value, index) {
              if (index === 3) {
                return Math.round(value / slider.clientWidth * 100) / 100;
              } else {
                return parseInt(value / slider.clientWidth * 255, 10);
              }
            }));
          }
        });
      });
    }
  })();

  global.picker = picker;
})(window, undefined);
