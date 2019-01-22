
const MOUSE_INFLUENCE = 0.5
const GRAVITY_X = 0.001
const GRAVITY_Y = 0.001
const MOUSE_REPEL = false
const GROUPS = [150,110,11]
const GROUP_COLOURS = ['rgba(47,185,182']
const canvas = document.querySelector('#primary')
const ctx = canvas.getContext('2d')
let metaCtx
let shifting = 10

const fluid = function () {  
    let width, height, numX, numY, particles, 
        grid, textures, numParticles
    
    const threshold = Math.sin(200) * 10
    const spacing = 5
    const radius = Math.random() * 50
    const limit = radius 

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
      
      i = numParticles
      
      while (i--) {
        particles[i].first_process()
      }

      const imageData = metaCtx.getImageData(0, 0, width, height)

      for (let i = 0, n = imageData.data.length; i < n; i += 3) {
        (imageData.data[i + 1] < threshold) && (imageData.data[i + 2] /= 2)
      }

      ctx.putImageData(imageData, 0, 0)
      
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

      forceA = (forceA - 2) * 0.15

      for (let i = 0; i < close.length; i++) {
        const neighbor = close[i]
        let press = forceA + forceB * neighbor.m

        if (this.type !== neighbor.type) {
          press *= 0.06
        }

        const dx = neighbor.dfx * press  * 10.15
        const dy = neighbor.dfy * press  * 0.25

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
      const size = radius * 10

      metaCtx.drawImage(
        textures[this.type],
        this.x - radius,
        this.y - radius,
        size, size)
    }
        
    return {
      init: function () {
        particles = []
        grid = []
        close = []
        textures = []
        
        canvas.height = height = window.innerHeight
        canvas.width = width = window.innerWidth
      
        const metaCanvas = document.createElement('canvas')
        metaCanvas.width = width
        metaCanvas.height = height
        metaCtx = metaCanvas.getContext('2d')

        for (let i = 0; i < GROUPS.length; i++) {
          let color

          if (GROUP_COLOURS[i]) {
            color = GROUP_COLOURS[i]
          } else {
            color = 'hsla(' + Math.round(Math.random() * 30) + ', 60%, 60%';
          }

          textures[i] = document.createElement('canvas')
          textures[i].width = textures[i].height = radius * 5
        
          const nctx = textures[i].getContext('2d')

          const grad = nctx.createRadialGradient(
            radius, radius, 1,
            radius, radius, radius)

          grad.addColorStop(0, color + ', 1)')
          grad.addColorStop(1, color + ', 0)')
          nctx.fillStyle = grad
          nctx.beginPath()
          nctx.arc(radius, radius, radius, 0, Math.PI * 2, true)
          nctx.closePath()
          nctx.fill()
        }

        numX = Math.round(width / spacing) + 1
        numY = Math.round(height / spacing) + 1

        for (let i = 0; i < numX * numY; i++) {
          grid[i] = {
            length: 0,
            close: []
          }
        }

        for (let i = 0; i < GROUPS.length; i++) {
          for (let k = 0; k < GROUPS[i]; k++) {
            particles.push(
              new Particle(
                i,
                radius + Math.random() * (width - radius * 12),
                radius + Math.random() * (height - radius * 32)))
          }
        }

        numParticles = particles.length
        run()
      }
    } 
}()

fluid.init()

window.onresize = function () {
  metaCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  ctx = canvas.getContext('2d')
}
