var packAmount = 1000;
function packPosition(x) {return Math.floor(x * packAmount);}
function unpackPosition(x) {return x / packAmount;}
function map(x, minin, maxin, minout, maxout) {return (maxout - minout) * (x - minin) / (maxin - minin) + minout;}
function clamp(x, min, max) {
  if(x < min) return min;
  if(x > max) return max;
  return x;
}
function lerp(a, b, t) {
  var result = new Object();
  for(x in a) {
    if(x in b) {
      result[x] = a[x] * (1 - t) + b[x] * t;
    }
  }
  return result;
}

var w, h;
$(document).ready(function() {
  w = $(document).width();
  h = $(document).height();
  //$("#cursors")[0].addEventListener('mousemove', mouseMoved);
  $("#cursors")[0].addEventListener('click', mouseMoved);
});
$(window).resize(function() {
  w = $(document).width();
  h = $(document).height();
});
var socket = io.connect();
var updateReady = true;
function mouseMoved(event) {
  //$("#bar").offset({left: event.pageX - 20, top:0});
  if(updateReady) {
    socket.emit('m', {
      x: packPosition(event.pageX / w),
      y: packPosition(event.pageY / h)
    });
    updateReady = false;
  }      
}
setInterval(function() {updateReady = true}, 100); // min time between sending mouse movement
var newMouseCollection = new Object();
var currentMouseCollection = new Object();
socket.on('mc', function (mouseCollection) {newMouseCollection = mouseCollection});
socket.on('id', function (id) {socket.id = id});
function updateCursors() {
  var cursors = $("#cursors");
  for(var id in currentMouseCollection) {
    if(!(id in newMouseCollection)) {
      delete currentMouseCollection[id];
      $("#" + id).remove();
    }
  }

  // smoothly update positions
  for(var id in newMouseCollection) {
    if(id in currentMouseCollection) {
      currentMouseCollection[id] = lerp(currentMouseCollection[id], newMouseCollection[id], .1);
    } else {
      currentMouseCollection[id] = new Object();
      currentMouseCollection[id] = newMouseCollection[id];
    }
  }

  var avg = 0, count = 0;
  for(var id in currentMouseCollection) {
    var mouse = currentMouseCollection[id];
    var x = unpackPosition(mouse.x);
    var y = unpackPosition(mouse.y);
    avg += clamp(x, .2, .8);
    count++;

    if(id != socket.id) { // don't show myself
      if(!$("#" + id).length) {
        // add new cursors
        cursors.append('<img src="cursor.png" id="' + id + '" style="position:absolute;"/>')
      }
      // update cursors
      $("#" + id).offset({left: x * w, top: y * h});
    }
  }
  avg /= count;
  var percentage = Math.floor(map((count == 0 ? .5 : avg), .2, .8, 100, 0));
  $("#percentage").text(percentage + "%");
  $("#bar").offset({left: avg * w - 20, top:0});
}
setInterval(function() {updateCursors()}, 33);