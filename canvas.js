 var canvas = document.getElementById('canvas');
 var context = canvas.getContext("2d");
var drawingSurfacsImageData = null; //存储画布上的数据
 var dragging = false;
 var loc = null;
 var mousedown = {};
 var img = document.getElementById("scream");
 var type = null;
var canvasDataArr = [];  // 存储画布上数据集合
var canvasBackUpDataArr = [];  // 撤销存储画布上数据集合
 var map = new Image();
 map.src = "map.png";

 map.onload = function () {
     context.drawImage(map, 10, 10, canvas.width - 20, canvas.height - 20);
     canvasDataArr.push(context.getImageData(0, 0, canvas.width, canvas.height));
 }

 function getStyles(obj) { //兼容FF，IE10; IE9及以下未测试
     return document.defaultView.getComputedStyle(obj);
 }
 //获取实际的鼠标在canvas的位置
 function windowToCanvas(x, y) {
     var bbox = canvas.getBoundingClientRect();
     // var leftB = parseInt(getStyles(canvas).borderLeftWidth); //获取的是样式，需要转换为数值
     // var topB = parseInt(getStyles(canvas).borderTopWidth);
     return {
         x: x - (bbox.left) * (canvas.width / bbox.width),
         y: y - (bbox.top) * (canvas.height / bbox.height)
     };

 }
 //保存当前的canvas上的数据
 function saveDrawingSurface() {
     drawingSurfacsImageData = context.getImageData(0, 0, canvas.width, canvas.height);
 }
 //恢复canvas的数据，主要用来显示最新的线段，擦除原来的线段
 function restoreDrawingSurface() {
     context.putImageData(drawingSurfacsImageData,
         0, 0, 0, 0, canvas.width, canvas.height
     );
 }
 //更新
 function updateRubberband(loc) {
     drawRubberbandShape(loc);
 }
 //画最新的线条
 function drawRubberbandShape(loc) {
     if (type == "1" || type == "3") {
         context.beginPath();
         context.setLineDash([]);
         if (type == "3") {
             context.setLineDash([5]); //绘制虚线
         }
         context.moveTo(mousedown.x, mousedown.y);
     } else if (type == "2" || type == "4") {
         context.setLineDash([]);
         if (type == "4") {
             context.setLineDash([5]); //绘制虚线
         }
     } else {
         context.setLineDash([]);
     }
     context.strokeStyle = "#f00";
     context.lineTo(loc.x, loc.y);
     context.stroke();
 }
 canvas.onmousedown = function (e) {
     loc = windowToCanvas(e.clientX, e.clientY);
     e.preventDefault();
     dragging = true;
     size = document.getElementById("racSize").value;
     if (type == "5") {
         restoreDrawingSurface(); // 防止move时画的橡皮擦残留影响
         var wid = e.offsetX;
         var hei = e.offsetY;
         context.beginPath();
         context.arc(wid, hei, size, 0, 2 * Math.PI);
         context.closePath();
         context.fillStyle = 'white';
         context.fill();
         saveDrawingSurface();
         context.strokeStyle = "green";
         context.stroke();
     } else {
         saveDrawingSurface();
     }

     mousedown.x = loc.x;
     mousedown.y = loc.y;
     context.beginPath();
     context.moveTo(mousedown.x, mousedown.y);
 };

 canvas.onmouseleave = function (e) {
     if (type == "5") {
         //   console.log("leave...")
         restoreDrawingSurface();
     }
 };

 canvas.onmousemove = function (e) {
     loc = windowToCanvas(e.clientX, e.clientY);
     e.preventDefault();
     if (dragging) {
         if (type == "1" || type == "3") {
             restoreDrawingSurface();
             updateRubberband(loc);
         } else if (type == "2" || type == "4") {
             mousedown.x = loc.x;
             mousedown.y = loc.y;
             updateRubberband(loc);
         }

     }
     if (type == "5") {
         size = document.getElementById("racSize").value;
         restoreDrawingSurface();
         var wid = e.offsetX;
         var hei = e.offsetY;
         context.beginPath();
         context.arc(wid, hei, size, 0, 2 * Math.PI);
         context.closePath();
         context.fillStyle = 'white';
         context.fill();
         if (dragging) {
             context.strokeStyle = "white";
             saveDrawingSurface();
         }
         context.strokeStyle = "green";
         context.stroke();

     }


 };
 canvas.onmouseenter = function () {
     type = document.getElementById("type").value;
     if (type == "5") {
         context.setLineDash([]);
         saveDrawingSurface();
     } 

}
 
 canvas.onmouseup = function (e) {
     loc = windowToCanvas(e.clientX, e.clientY);
     if (type !== "5") {
         //鼠标放开后存储当前画布数据
        
         restoreDrawingSurface();
         updateRubberband(loc);
       
     } else {
         restoreDrawingSurface();
     }
     canvasDataArr.push(context.getImageData(0, 0, canvas.width, canvas.height)); 
     //鼠标抬起，拖动标记设为否
     dragging = false;
};
document.getElementById("backup").onclick = function () { 
    if (canvasDataArr.length > 1) { 
        canvasBackUpDataArr.push(canvasDataArr.pop());
        drawingSurfacsImageData = canvasDataArr[canvasDataArr.length - 1];
        restoreDrawingSurface();
    }
}
document.getElementById("backupCancel").onclick = function () {
    if (canvasBackUpDataArr.length > 0) { 
        drawingSurfacsImageData = canvasBackUpDataArr.pop();
        canvasDataArr.push(drawingSurfacsImageData);
        restoreDrawingSurface();
    }
}