
const MOUSE_INFLUENCE = 1
const GRAVITY_X = 0
const GRAVITY_Y = 0
const MOUSE_REPEL = false
const GROUPS = [2,10,10]
const GROUP_COLOURS = ['rgba(17,140,202']

const fluid = function () {  
    let ctx, width, height, numX, numY, particles, 
        grid, metaCtx, textures, numParticles
    
    const threshold = 120
    const spacing = 315
    const radius = 100 
    const limit = radius * 0.56 
    
    const process = function () {
        const imageData = metaCtx.getImageData(0, 0, width, height)
        const pix = imageData.data

        for (let i = 0, n = pix.length; i < n; i += 4) {
          (pix[i + 3] < threshold) && (pix[i + 3] /= 6)
        }

        ctx.putImageData(imageData, 0, 0)
    }

    const run = function () {
      metaCtx.clearRect(0, 0, width, height)

      for (let i = 0, l = numX * numY; i < l; i++) {
        grid[i].length = 0
      }

      let i = numParticles
      
      while (i--) {
        particles[i].first_process()
      }
      
      i = numParticles
      
      while (i--) {
        particles[i].second_process()
      }

      process()

      const fillStyles = ['rgba(217, 160, 232, 0.005)', 
                          'rgba(227, 50, 232, 0.005)', 
                          'rgba(117, 160, 232, 0.005)']              

      fillStyles.map(f => {
        ctx.fillStyle = f
        ctx.beginPath()
        ctx.arc(Math.random() * window.innerWidth, 
                Math.random() * window.innerHeight,
                radius * MOUSE_INFLUENCE, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      })

     requestAnimationFrame(run)
    };
    
    const Particle = function (type, x, y) {
      this.type = type
      this.x = x
      this.y = y
      this.px = x
      this.py = y
      this.vx = 0
      this.vy = 0
    };
    
    Particle.prototype.first_process = function () {
      const g = grid[Math.round(this.y / spacing) * numX + Math.round(this.x / spacing)]

      if (g) {
        g.close[g.length++] = this
      }

      this.vx = this.x - this.px
      this.vy = this.y - this.py

      const distX = this.x - Math.random() * window.innerWidth
      const distY = this.y - Math.random() * window.innerHeight
      const dist = Math.sqrt(distX * distX + distY * distY)

      if (dist < radius * MOUSE_INFLUENCE) {
          const cos = distX / dist
          const sin = distY / dist

          this.vx += (MOUSE_REPEL) ? cos : -cos
          this.vy += (MOUSE_REPEL) ? sin : -sin
      }

      this.vx += GRAVITY_X
      this.vy += GRAVITY_Y
      this.px = this.x
      this.py = this.y
      this.x += this.vx
      this.y += this.vy
    };
        
    Particle.prototype.second_process = function () {
      let forceA = 0
      let forceB = 0
      let cellX = Math.round(this.x / spacing)
      let cellY = Math.round(this.y / spacing)
      let close = []

      for (let xOff = -1; xOff < 2; xOff++) {
        for (let yOff = -1; yOff < 2; yOff++) {
          const cell = grid[(cellY + yOff) * numX + (cellX + xOff)]
          
          if (cell && cell.length) {
            for (let a = 0; a < cell.length; a++) {
              const particle = cell.close[a]
              
              if (particle !== this) {
                const dfx = particle.x - this.x
                const dfy = particle.y - this.y
                const distance = Math.sqrt(dfx * dfx + dfy * dfy)
                
                if (distance < spacing) {
                  const m = 1 - (distance / spacing)
                  forceA += Math.pow(m, 2)
                  forceB += Math.pow(m, 3) / 2
                  particle.m = m
                  particle.dfx = (dfx / distance) * m
                  particle.dfy = (dfy / distance) * m
                  close.push(particle)
                }
              }
            }
          }
        }
      }

      forceA = (forceA - 3) * 0.35

      for (let i = 0; i < close.length; i++) {
        const neighbor = close[i]
        const press = forceA + forceB * neighbor.m

        if (this.type !== neighbor.type) {
          press *= 0.35
        }

        const dx = neighbor.dfx * press * 0.825
        const dy = neighbor.dfy * press * 0.25

        neighbor.x += dx
        neighbor.y += dy
        this.x -= dx
        this.y -= dy
      }

      if (this.x < limit) {
        this.x = limit
      } else if (this.x > width - limit) {
        this.x = width - limit
      }

      if (this.y < limit) {
        this.y = limit
      } else if (this.y > height - limit) {
        this.y = height - limit
      }

      this.draw()
    };
            
    Particle.prototype.draw = function () {
      const size = radius * 2

      metaCtx.drawImage(
        textures[this.type],
        this.x - radius,
        this.y - radius,
        size, size)
    }
        
    return {
      init: function(canvas, w, h) {
        particles = []
        grid = []
        close = []
        textures = []

          var canvas 	  = document.getElementById(canvas);
              ctx   	      = canvas.getContext('2d');
              canvas.height = h || window.innerHeight;
              canvas.width  = w || window.innerWidth;
              width         = canvas.width;
              height        = canvas.height;

          var meta_canvas    = document.createElement("canvas");
              meta_canvas.width  = width;
              meta_canvas.height = height;
              meta_ctx           = meta_canvas.getContext("2d");

          for(var i = 0; i < GROUPS.length; i++) {

              var colour;

              if(GROUP_COLOURS[i]) {
                  colour = GROUP_COLOURS[i];
              } else {
                  colour =
                  'hsla(' + Math.round(Math.random() * 155) + ', 50%, 60%';
              }

              textures[i] = document.createElement("canvas");
              textures[i].width  = radius * 2;
              textures[i].height = radius * 2;
              var nctx = textures[i].getContext("2d");

              var grad = nctx.createRadialGradient(
                  radius,
                  radius,
                  1,
                  radius,
                  radius,
                  radius
                  );

              grad.addColorStop(0, colour + ',1)');
              grad.addColorStop(1, colour + ',0)');
              nctx.fillStyle = grad;
              nctx.beginPath();
              nctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
              nctx.closePath();
              nctx.fill();
          }

          num_x = Math.round(width / spacing) + 1;
          num_y = Math.round(height / spacing) + 1;

          for (var i = 0; i < num_x * num_y; i++) {
              grid[i] = {
                  length: 0,
                  close: []
              }
          }

          for (var i = 0; i < GROUPS.length; i++ ) {
              for (var k = 0; k < GROUPS[i]; k++ ) {
                  particles.push(
                      new Particle(
                          i,
                          radius + Math.random() * (width - radius * 12),
                          radius + Math.random() * (height - radius * 32)
                          )
                      );
              }
          }

          num_particles = particles.length

          run();
      }
    };
    
}();

fluid.init('c', window.innerWidth, window.innerHeight);
