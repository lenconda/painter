window.onload = function() {
  // 禁止右键菜单
  document.oncontextmenu = function() { return false; };

  var painter = document.getElementById('painter');
  var context = painter.getContext('2d');

  var controlPanelWrapper = document.getElementById('wrapper');
  var switchPencilButton = document.getElementById('switch-pencil');
  var switchEraserButton = document.getElementById('switch-eraser');
  var clearButton = document.getElementById('clear');
  var undoButton = document.getElementById('undo');
  var redoButton = document.getElementById('redo');
  var currentColor = document.getElementById('color');
  var backgroundColor = document.getElementById('background-color');
  var downloadButton = document.getElementById('download');

  painter.width = document.body.clientWidth;
  painter.height = document.body.clientHeight;

  // 数据中心
  var data = {};

  // 防抖
  var debounce = (function() {
    var _this = this;
    var timer = null;

    return function(fn, timeout) {
      if (!(typeof fn === 'function') || !!!fn) { return; }

      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(_this, arguments);
      }, timeout);
    }
  })();

  // 设置背景颜色
  function setBackgroundColor(color) {
    context.fillStyle = color;
    context.fillRect(0, 0, painter.clientWidth, painter.clientHeight);
  }

  Object.defineProperty(data, 'undoStack', {
    enumerable: true,
    configurable: true,
    get: function() { return this._undoStack; },
    set: function(v) {
      this._undoStack = v;
      if (v.length <= 1) {
        undoButton.setAttribute('disabled', true);
      } else {
        undoButton.removeAttribute('disabled');
      }
      return v;
    },
  });

  Object.defineProperty(data, 'redoStack', {
    enumerable: true,
    configurable: true,
    get: function() { return this._redoStack; },
    set: function(v) {
      this._redoStack = v;
      if (v.length === 0) {
        redoButton.setAttribute('disabled', true);
      } else {
        redoButton.removeAttribute('disabled');
      }
      return v;
    },
  });

  Object.defineProperty(data, 'eraser', {
    enumerable: true,
    configurable: true,
    get: function() { return this._eraser; },
    set: function(v) {
      this._eraser = v;
      if (v) {
        switchEraserButton.classList.add('active');
        switchPencilButton.classList.remove('active');
      } else {
        switchEraserButton.classList.remove('active');
        switchPencilButton.classList.add('active');
      }
      return v;
    }
  });

  Object.defineProperty(data, 'strokeStyle', {
    enumerable: true,
    configurable: true,
    get: function() { return this._strokeStyle; },
    set: function(v) {
      this._strokeStyle = v;
      currentColor.style.backgroundColor = v;
      return v;
    }
  });

  Object.defineProperty(data, 'backgroundColor', {
    enumerable: true,
    configurable: true,
    get: function() { return this._backgroundColor; },
    set: function(v) {
      this._backgroundColor = v;
      setBackgroundColor(v);
      backgroundColor.style.backgroundColor = v;
      return v;
    }
  });

  ['painting', 'lineWidth', 'currentPoint'].forEach(function(value) {
    Object.defineProperty(data, value, {
      enumerable: true,
      configurable: true,
      get: function() { return this['_' + value]; },
      set: function(v) {
        this['_' + value] = v;
        return v;
      },
    });
  });

  // 撤销栈
  data.undoStack = [context.getImageData(0, 0, painter.clientWidth, painter.clientHeight)];
  // 重做栈
  data.redoStack = [];
  // 是否在绘制
  data.painting = false;
  // 是否使用橡皮擦
  data.eraser = false;
  // 画笔颜色
  data.strokeStyle = '#000';
  // 画笔粗细
  data.lineWidth = 2;
  // 当前点
  data.currentPoint = { x: null, y: null, };
  // 背景颜色
  data.backgroundColor = '#fff';

  function switchController(eraser) {
    data.eraser = eraser;
  }

  switchPencilButton.addEventListener('click', function() {
    switchController(false);
  });

  switchEraserButton.addEventListener('click', function() {
    switchController(true);
  });

  clearButton.addEventListener('click', function() {
    context.clearRect(0, 0, painter.clientWidth, painter.clientHeight);
    data.undoStack = data.undoStack.concat(context.getImageData(0, 0, painter.clientWidth, painter.clientHeight));
  });

  function drawLine(startPointXAxis, startPointYAxis, endPointXAxis, endPointYAxis) {
    context.beginPath();
    context.lineWidth = data.lineWidth;
    // 线条末端样式
    context.lineCap = 'round';
    // 线条接合处样式
    context.lineJoin = 'round';
    // 设置画笔颜色
    context.strokeStyle = data.strokeStyle;
    context.moveTo(startPointXAxis, startPointYAxis);
    context.lineTo(endPointXAxis, endPointYAxis);
    context.stroke();
    context.closePath();
  }

  // 解决了在控制栏画图时图线不流畅的问题
  ['mousedown', 'mouseup', 'mousemove'].forEach(function(value) {
    controlPanelWrapper.addEventListener(value, function(event) {
      // 当鼠标在控制板中间被按下时阻止事件
      if (value === 'mousedown' && event.target !== this) {
        return false;
      }
      painter.dispatchEvent(new MouseEvent(event.type, event));
    });
  });

  function undo() {
    var lastImageData = data.undoStack[data.undoStack.length - 1];
    var newImageData = data.undoStack[data.undoStack.length - 2];
    data.undoStack = data.undoStack.slice(0, -1);
    data.redoStack = data.redoStack.concat(lastImageData);
    newImageData && context.putImageData(newImageData, 0, 0);
  }

  function redo() {
    var previousImageData = data.redoStack[data.redoStack.length - 1];
    data.redoStack = data.redoStack.slice(0, -1);
    data.undoStack = data.undoStack.concat(previousImageData);
    previousImageData && context.putImageData(previousImageData, 0, 0);
  }

  function download() {
    var currentImageDataURL = painter.toDataURL('image/png');
    var downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', currentImageDataURL);
    downloadLink.setAttribute('download', Date.parse(new Date()).toString() + '.png');
    downloadLink.click();
  }

  painter.addEventListener('mousedown', function(event) {
    if (event.button === 0) {
      data.painting = true;
      var currentPointXAxis = event.clientX;
      var currentPointYAxis = event.clientY;

      data.currentPoint = {
        x: currentPointXAxis,
        y: currentPointYAxis,
      };
    }
  });

  painter.addEventListener('mouseup', function() {
    data.painting = false;
  });

  painter.addEventListener('mousemove', function(event) {
    var currentPointXAxis = event.clientX;
    var currentPointYAxis = event.clientY;

    if (data.painting) {
      if (data.eraser) {
        var eraseWidth = data.lineWidth * 10;
        context.clearRect(currentPointXAxis - data.lineWidth, currentPointYAxis - data.lineWidth, eraseWidth, eraseWidth);
      } else {
        drawLine(data.currentPoint.x, data.currentPoint.y, currentPointXAxis, currentPointYAxis);
        data.currentPoint = {
          x: currentPointXAxis,
          y: currentPointYAxis,
        };
      }

      debounce(function() {
        data.undoStack = data.undoStack.concat(context.getImageData(0, 0, painter.clientWidth, painter.clientHeight));
      }, 500);
    }
  });

  undoButton.addEventListener('click', undo);
  redoButton.addEventListener('click', redo);
  downloadButton.addEventListener('click', download);
}
