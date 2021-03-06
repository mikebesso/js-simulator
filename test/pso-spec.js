var expect = require('chai').expect;
var jssim = require('../src/jssim');

describe('Particle Swarm', function() {
   it('should behavior like PSO', function(){
      
     var global_best_x = 0;
     var global_best_y = 0;
     var global_best_cost = 1000000;
     var C1 = 1;
     var C2 = 2;
     var particleCount = 400;

     var ParticleAgent = function(id, world) {
          jssim.SimEvent.call(this);
          this.grid = world;
          this.x = Math.floor(Math.random() * 128);
          this.y = Math.floor(Math.random() * 128);
          this.localBestX = this.x;
          this.localBestY = this.y;
          this.localBestCost = 1000000;
          this.vX = 0;
          this.vY = 0;
          this.id = id;
          this.cost = 1000000;
      }; 

      ParticleAgent.prototype = Object.create(jssim.SimEvent.prototype);
      ParticleAgent.prototype.update = function (deltaTime) {
          this.updateVelocity();
          this.updatePosition();
          this.evaluateCost();
          this.updateLocalBest();
          this.updateGlobalBest();
      };

      ParticleAgent.prototype.evaluateCost = function() {
          this.cost = RosenBrock(this.x, this.y);
      };

      ParticleAgent.prototype.updateGlobalBest = function() {
          if(this.localBestCost > this.cost) {
              this.localBestX = this.x;
              this.localBestY = this.y;
              this.lcoalBestCost = this.cost;
          }
      };

      ParticleAgent.prototype.updateLocalBest = function() {
          if(global_best_cost > this.cost) {
              global_best_cost = this.cost;
              global_best_x = this.x;
              global_best_y = this.y;
          }
      };

      ParticleAgent.prototype.updateVelocity = function() {
        var oldVX = this.vX;
        var oldVY = this.vY;

        var oldX = this.x;
        var oldY = this.y;

        var r1 = Math.random();
        var r2 = Math.random();
        var r3 = Math.random();

        var w = 0.5 + r3 / 2;
        var newVX = w * oldVX + C1 * r1 * (this.localBestX - oldX) + C2 * r2 * (global_best_x - oldX);

        r1 = Math.random();
        r2 = Math.random();
        r3 = Math.random();

        w = 0.5 + r3 / 2;
        var newVY = w * oldVY + C1 * r1 * (this.localBestY - oldY) + C2 * r2 * (global_best_y - oldY);

        this.vX = newVX;
        this.vY = newVY;
      };

      ParticleAgent.prototype.updatePosition = function() {
        this.grid.setCell(this.x, this.y, 0);
        this.x = Math.min(127, this.vX + this.x);
        this.y = Math.min(127, this.vY + this.y);
        this.x = Math.max(0, Math.floor(this.x));
        this.y = Math.max(0, Math.floor(this.y));
        this.grid.setCell(this.x, this.y, 1);
      };

      var scheduler = new jssim.Scheduler();
      var grid = new jssim.Grid(128, 128);
      grid.cellWidth = 5;
      grid.cellHeight = 5;
      grid.showPotentialField = true;

      function RosenBrock(x, y) {
         x = (x - 64) * 5.0 / 128.0;
         y = (y - 64) * 5.0 / 128.0;
         var expr1 = (x*x - y);
         var expr2 = 1 - x;
         return 100 * expr1*expr1 + expr2*expr2;
      }

      function Rastrigin(x, y) {
          x = (x - 64) * 5.12 / 128.0;
         y = (y - 64) * 5.12 / 128.0;
          return 20 + x*x - 10*Math.cos(2*Math.PI*x) + y*y - 10*Math.cos(2*Math.PI*y);
      }

      function Griewangk(x, y) {
          x = (x - 64) * 600 / 128.0;
         y = (y - 64) * 600 / 128.0;
          return (1 + (x*x) / 4000 + (y*y) / 4000 - Math.cos(x) * Math.cos(y / Math.sqrt(2)));
      }

      function init() {
          scheduler.reset();
          grid.reset();


          for(var x = 0; x < 128; ++x) {
              for(var y=0; y < 128; ++y) {
                   grid.setPotential(x, y, Rastrigin(x, y));
              }
          }

          global_best_x = Math.floor(Math.random() * 128);
          global_best_y = Math.floor(Math.random() * 128);
          global_best_cost = RosenBrock(global_best_x, global_best_y);

          for(var i = 0; i < particleCount; ++i) {
            scheduler.scheduleRepeatingIn(new ParticleAgent(i, grid), 1);
          }
      }

      init();
      while(scheduler.current_time < 5) {
          scheduler.update();
      }
   });
});