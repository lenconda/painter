window.onload = function() {
  var painter = document.getElementById('painter');
  var context = painter.getContext('2d');

  var controlPanelWrapper = document.getElementById('wrapper');
  var switchPencilButton = document.getElementById('switch-pencil');
  var switchEraserButton = document.getElementById('switch-eraser');
  var clearButton = document.getElementById('clear');
  var undoButton = document.getElementById('undo');
  var redoButton = document.getElementById('redo');

  painter.width = document.body.clientWidth;
  painter.height = document.body.clientHeight;

  // 当鼠标按下时置 true
  var painting = false;
  // 使用橡皮擦时置 true
  var eraser = false;
  var currentPoint = { x: null, y: null };
  // 画线粗细
  var lineWidth = 2;
  // 画笔颜色
  var strokeStyle = '#000';
  // 撤销栈
  var undoStack = [];
  // 重做栈
  var redoStack = [];

  function setControllerClass() {
    if (eraser) {
      switchEraserButton.classList.add('active');
      switchPencilButton.classList.remove('active');
    } else {
      switchEraserButton.classList.remove('active');
      switchPencilButton.classList.add('active');
    }
  }

  function setUndoRedoButtonsClass() {
    undoStack.length === 0
    ? undoButton.setAttribute('disabled', true)
    : undoButton.removeAttribute('disabled');

    redoStack.length === 0
    ? redoButton.setAttribute('disabled', true)
    : undoButton.removeAttribute('disabled');
  }

  setControllerClass();
  setUndoRedoButtonsClass();

  function switchController() {
    eraser = !eraser;
    setControllerClass();
  }

  switchPencilButton.addEventListener('click', function() {
    switchController();
  });

  switchEraserButton.addEventListener('click', function() {
    switchController();
  });

  clearButton.addEventListener('click', function() {
    context.clearRect(0, 0, painter.clientWidth, painter.clientHeight);
  });

  function drawLine(startPointXAxis, startPointYAxis, endPointXAxis, endPointYAxis) {
    context.beginPath();
    context.lineWidth = lineWidth;
    // 线条末端样式
    context.lineCap = 'round';
    // 线条接合处样式
    context.lineJoin = 'round';
    // 设置画笔颜色
    context.strokeStyle = strokeStyle;
    context.moveTo(startPointXAxis, startPointYAxis);
    context.lineTo(endPointXAxis, endPointYAxis);
    context.stroke();
    context.closePath();
  }

  // 解决了在控制栏画图时图线不流畅的问题
  controlPanelWrapper.addEventListener('mousedown', function(event) {
    var e = new MouseEvent(event.type, event);
    painter.dispatchEvent(e);
  });

  controlPanelWrapper.addEventListener('mouseup', function(event) {
    var e = new MouseEvent(event.type, event);
    painter.dispatchEvent(e);
  });

  controlPanelWrapper.addEventListener('mousemove', function(event) {
    var e = new MouseEvent(event.type, event);
    painter.dispatchEvent(e);
  });

  painter.addEventListener('mousedown', function(event) {
    painting = true;
    var currentPointXAxis = event.clientX;
    var currentPointYAxis = event.clientY;

    currentPoint = {
      x: currentPointXAxis,
      y: currentPointYAxis,
    };
  });

  painter.addEventListener('mouseup', function() {
    painting = false;
  });

  painter.addEventListener('mousemove', function(event) {
    var currentPointXAxis = event.clientX;
    var currentPointYAxis = event.clientY;

    if (painting) {
      if (eraser) {
        var eraseWidth = lineWidth * 10;
        context.clearRect(currentPointXAxis - lineWidth, currentPointYAxis - lineWidth, eraseWidth, eraseWidth);
      } else {
        drawLine(currentPoint.x, currentPoint.y, currentPointXAxis, currentPointYAxis);
        currentPoint = {
          x: currentPointXAxis,
          y: currentPointYAxis,
        };
      }
    }
  });
}
