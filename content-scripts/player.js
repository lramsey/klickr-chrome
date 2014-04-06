/* ------------------------------------------------------------------------------------*/
/* Player Class
/*
/* ------------------------------------------------------------------------------------*/

var Player = function(){};

window.Player = Player;

// moves mouse to given destination with duration
  Player.prototype.move = function (endX, endY, duration){
    d3.select('.mouse')
     .transition()
     .duration(duration)
     .style({'top':  endY + 'px', 'left': endX + 'px'});
  };

  // chains mouse moves together
  Player.prototype.processData = function(arr, index, xScale, yScale){
    index = index || 1;
    xScale = xScale || 1;
    yScale = yScale || 1;
    if ( index === arr.length ) {
      $('.mouse').detach();
      console.log('movement finished');
    } else {
      arr[index].t = arr[index].t || 100;
      var xAdjusted = (arr[index].clientX * xScale);
      var yAdjusted = (arr[index].clientY * yScale);
      var xClientOrigin = (arr[index].pageX * xScale) - xAdjusted;
      var yClientOrigin = (arr[index].pageY * yScale) - yAdjusted;
      //$(window).scrollLeft(xClientOrigin)  $(window).scrollTop(yClientOrigin);
      this.move(xAdjusted, yAdjusted ,arr[index].t);
      var that = this;
      setTimeout(function(){
        that.processData(arr, index+1);
      }, arr[index].t );
    }
  };

  Player.prototype.playRecording = function(data){
    var xScale = $(window).width() / data["width"];
    var yScale = $(window).height() / data["height"];
    var movement = data["ticks"];
    movement[0].t = 0;
    $('body').append('<div class="mouse" style="position:absolute; background: red; width: 15px; height:15px; border-radius: 7.5px; top: '+movement[0].pageY+'px; left:'+movement[0].pageX+'px;"></div>');
    for (var i = 1; i < movement.length-1; i++){
      movement[i].t = movement[i]["timestamp"] - movement[i-1]["timestamp"];
    }
    this.processData(movement, 1, xScale, yScale);
  };

  Player.prototype.getData = function(clickId){
    var that = this;
    $.ajax({
      url: 'http://jyek.cloudapp.net:3004/klicks/'+clickId,
      type: 'GET',
      contentType: 'application/json',
      success: function(data){
        if(Array.isArray(data)){
          data = data[data.length-3];
        }
        that.playRecording(data);
      }
    });
  };

  Player.prototype.playKlick = function(clickId){
    clickId = clickId || '';
    this.getData(clickId);
  };


/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function(){

  //helper for playing back mouse actions
  var player = new Player();

  // Listens to messages from background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'playKlick'){
      console.log('play button clicked');
      player.playKlick(request.id);
      sendResponse({response: "Player: Playing Klick..."});
    }
  });

});
