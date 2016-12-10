(function() {
  var mapData = [{
    name: '1',
    color: '#2ecc98',
    path: [{
      direct: 'up',
      distance: '200'
    }, {
      direct: 'right',
      distance: '150'
    }, {
      direct: 'up',
      distance: '200'
    }]
  }, {
    name: '1',
    color: '#23b1bf',
    path: [{
      direct: 'left',
      distance: '200'
    }, {
      direct: 'up',
      distance: '220'
    }]
  }, {
    name: '1',
    color: '#da693d',
    path: [{
      direct: 'up',
      distance: '100'
    }]
  }]

  function Canvas(target) {
    this.context = target.getContext('2d')
  }

  Canvas.prototype = {
    constructor: Canvas,
    save: function() {
      this.context.save()
    },
    end: function() {
      this.context.closePath()
    },
    drawCircle: function(x, y, color) {
      this.context.beginPath()
      this.context.fillStyle = color;
      this.context.arc(x, y, CIRCLE_W, 0, Math.PI * 2, true)
      this.context.fill()
      this.context.closePath()
      this.save()
    },
    drawRect: function(x, y, width, height, color) {
      this.context.fillStyle = color
      this.context.fillRect(x, y, width, height)
      this.save()
    }
  }

  var MW = 3000
  var MH = 3000
  var CIRCLE_W = 60
  var RECT_W = 50
  var RECT_W_HALF = RECT_W / 2
  var position = {
    x: MW / 2,
    y: MH / 2 + 200
  }

  function Game(mapData) {
    this.canvas = new Canvas(document.querySelector('#canvas'))
    this.mapData = mapData
    this.position = {
      x: MW / 2,
      y: MH / 2 + 200
    }
    this.init()
  }

  Game.prototype = {
    constructor: Game,
    init: function() {
      this.drawMap()
    },
    updatePosition(x, y) {
    	this.position.x = x
    	this.position.y = y
    },
    drawMap: function() {
      var prevDirect = ''
      this.mapData.forEach((function(map, index) {
        this.position = this.getCirclePosition(prevDirect, !index)
        this.canvas.drawCircle(this.position.x, this.position.y, map.color)
        this.drawRect(map.path, map.color)
        prevDirect = map.path.slice(-1)[0].direct
      }).bind(this))
      this.canvas.end()
    },
    drawRect: function(pathes, color) {
    	var x = this.position.x,
    			y = this.position.y
      var direct, prevDirect, distance, isFirst
      pathes.forEach((function(path, index) {
      	isFirst = !index
        direct = path.direct
        distance = +path.distance
        switch (direct) {
          case 'up':
            if (isFirst) {
              x = x - RECT_W_HALF
              y = y - distance
            } else {
              x = x + (prevDirect == 'right' ? -RECT_W : +0)
              y = y - distance + RECT_W
            }
            this.canvas.drawRect(x, y, RECT_W, distance, color)
            break
          case 'right':
            if (isFirst) {
              x = x
              y = y - RECT_W_HALF
            } else {
              x = x
              y = y
            }
            this.canvas.drawRect(x, y, distance, RECT_W, color)
            x = x + distance
            break
          case 'left':
            if (isFirst) {
              x = x - distance
              y = y - RECT_W_HALF
            } else {
              x = x - distance + RECT_W
              y = y
            }
            this.canvas.drawRect(x, y, distance, RECT_W, color)
            break
        }
        prevDirect = direct
      }).bind(this))
      this.updatePosition(x, y)
    },
    getCirclePosition: function(prevDirect, isFirst) {
    	var x = this.position.x,
    			y = this.position.y
      if (!isFirst) {
        switch (prevDirect) {
          case 'up':
            x = x + RECT_W_HALF
            y = y
            break
          case 'right':
            x = x
            y = y + RECT_W_HALF
            break
          case 'left':
            x = x
            y = y + RECT_W_HALF
            break
        }
      }
      this.updatePosition(x, y)
      return this.position
    }
  }

  new Game(mapData)


  var $startBtn = document.querySelector('.start_btn')
  var $markWrap = document.querySelector('.mark_wrap')
  $startBtn.addEventListener('click', function(e) {
  	$markWrap.classList.add('hide')
  }, false)

})()
