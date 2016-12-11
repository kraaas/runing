(function() {
  var mapData = [{
    name: '1',
    color: '#2ecc98',
    path: [{
      leve: 1,
      direct: 'top',
      distance: '200'
    }, {
      leve: 1,
      direct: 'right',
      distance: '200'
    }, {
      leve: 1,
      last: true,
      direct: 'top',
      distance: '200'
    }]
  }, {
    name: '1',
    color: '#23b1bf',
    path: [{
      leve: 2,
      direct: 'top',
      distance: '200'
    }, {
      leve: 2,
      last: true,
      direct: 'right',
      distance: '220'
    }]
  }, {
    name: '1',
    color: '#da693d',
    path: [{
      leve: 3,
      direct: 'right',
      distance: '300'
    },{
      leve: 3,
      direct: 'top',
      distance: '300'
    },{
      leve: 3,
      last: true,
      direct: 'left',
      distance: '300'
    }]
  },{
    name: '1',
    color: '#2ecc98',
    path: [{
      leve: 4,
      direct: 'left',
      distance: '200'
    }, {
      leve: 4,
      direct: 'top',
      distance: '400'
    }, {
      leve: 4,
      last: true,
      direct: 'left',
      distance: '300'
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
  var MAN_W = 30
  var MAN_W_HALF = MAN_W / 2
  var CIRCLE_W = 60
  var RECT_W = 50
  var RECT_W_HALF = RECT_W / 2
  var OFFSET_Y = 0
  var CLIENT_H = document.documentElement.clientHeight
  var CLIENT_W = document.documentElement.clientWidth

  function Game(mapData) {
    this.$target = document.querySelector('#canvas')
    this.canvas = new Canvas(this.$target)
    this.$startBtn = document.querySelector('.start_btn')
    this.$markWrap = document.querySelector('.mark_wrap')
    this.mapData = mapData
    this.bit = 0
    this.position = {
      x: MW / 2,
      y: MH / 2 + OFFSET_Y
    }
    this.init()
  }

  Game.prototype = {
    constructor: Game,
    init: function() {
      this.setMapPosition()
      this.drawMap()
      this.bindEvent()
    },
    bindEvent: function() {
      this.$startBtn.addEventListener('click', (function(e) {
        e.stopPropagation()
        this.$markWrap.classList.add('hide')
        setTimeout((function() {
          this.start()
        }).bind(this), 300)
      }).bind(this), false)

      document.addEventListener('click', (function(e) {
        this.walk(++this.bit)
      }).bind(this), false)
    },
    setMapPosition: function() {
      this.$target.style.top = (CLIENT_H / 2) + 'px'
      this.$target.style.left = CLIENT_W / 2 + 'px'
    },
    start: function() {
      this.createMan()
      this.pathes = this.getPathes()
      this.walk()
    },
    getPathes: function() {
      return mapData.map(function(map, index) {
        return map.path
      }).reduce(function(prev, next) {
        return prev.concat(next)
      })
    },
    walk: function(bit) {
      bit = bit || 0
      if (bit >= this.pathes.length) {
        alert('闯关成功！')
        return
      }
      var path = this.pathes[bit]
      this.moveTo(path)
    },
    moveTo: function(path) {
      var direct = path.direct,
        distance = path.distance,
        isLast = path.last,
        leve = path.leve,
        isRight = direct == 'right',
        _this = this,
        current,
        step
      if (this.timer) {
        cancelAnimationFrame(this.timer)
      }
      if (isOver()) {
        return
      }
      this.distance = distance
      direct = isRight ? 'left' : direct
      current = parseInt(this.$target.style[direct])
      step = isRight ? -2*leve : 2*leve
      this.count = 0
      go()
      function go() {
        _this.now = parseInt(_this.$target.style[direct])
        if (isContinue()) {
          _this.$target.style[direct] = (_this.now + step) + 'px'
          _this.count += Math.abs(step)
          _this.timer = requestAnimationFrame(go)
        } else if (isLast) {
          _this.walk(++_this.bit)
        } else {
          alert('over')
          cancelAnimationFrame(_this.timer)
        }
      }
      function isOver() {
        if (_this.count < _this.distance - 1.5 * RECT_W) {
          alert('Game Over!')
          return true
        }
      }
      function isContinue() {
        if (isRight) {
          return _this.count <= (distance - RECT_W)
        } else {
          return _this.count <= (distance - MAN_W_HALF)
        }
      }
    },
    createMan: function() {
      var $man = document.createElement('div')
      this.$man = $man
      $man.classList.add('man')
      $man.style.top = (CLIENT_H / 2 + OFFSET_Y) + 'px'
      $man.style.left = CLIENT_W / 2 + 'px'
      document.body.appendChild($man)
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
          case 'top':
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
        if (prevDirect == 'top') {
          x = x + RECT_W_HALF
          y = y
        } else {
          x = x
          y = y + RECT_W_HALF
        }
      }
      this.updatePosition(x, y)
      return this.position
    }
  }

  new Game(mapData)

})()
