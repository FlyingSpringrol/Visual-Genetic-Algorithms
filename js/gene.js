
function Gene(x,y, size, context, points, colors){
   if (points != undefined){ //allows passing in of saved points
      this.points = points;
   }
   if (colors != undefined){
      this.r = colors[0];
      this.g = colors[1];
      this.b = colors[2];
      this.a = colors[3];
      this.alpha = colors[4];
   }
   this.x = x;
   this.y = y;
   this.context = context;
   //everything itialized
   if (colors === undefined){
      this.r = 0;
      this.g = 0;
      this.b = 0;
      this.a = 0;
      this.alpha = 0;
      this.randomlyInitialize();
   }
   if (points === undefined){
      this.points = [];
      this.createPoints();
   }
}

Gene.prototype= {
   randomlyInitialize: function(){
      this.r = parseInt(Math.random() * 255);
      this.g = parseInt(Math.random() * 255);
      this.b = parseInt(Math.random() * 255);
      this.a = parseInt(Math.random() * 255);
      this.alpha = Math.random()/2;
   },
   createPoints: function(){ //generates points randomly based on the genes x,y and size
      var point1 = [this.x,this.y];
      var size; //used to fix a weird bug
      if (!this.size){
         size = 2;
      }
      else size = this.size;
      var point2 = [parseInt(this.x + (Math.random() * size)), parseInt(this.y + (Math.random() * size))];
      var point3 = [parseInt(this.x + (Math.random() * size)), parseInt(this.y + (Math.random() * size))];

      this.points[0]=(point1);
      this.points[1]=(point2);
      this.points[2]=(point3);
   },
   shiftPoints: function(expandFactor, point_shift){ //would like freedom to rotate and move
      for (var j = 0; j < this.points.length; j++){ //moves all points
         var chance = Math.random();
         if (point_shift > chance){
            var point = this.points[j];
            var radian = randomRadian();
            point[0] += Math.cos(radian) * expandFactor;
            point[1] += Math.sin(radian) * expandFactor;
         }
      }
      this.size += expandFactor;
   },
   moveShape: function(movement){
      var direct1 = Math.random() > .5 ? -1 : 1; //moves left or right
      var direct2 = Math.random() > .5 ? -1 : 1; //moves left or right
      for (var j = 0; j < this.points.length; j++){ //moves all points
         var point = this.points[j];
         point[0] += direct1 * movement;
         point[1] += direct2 * movement;
      }
   },
   removePoint: function(){
      var index1 = parseInt(Math.random() * this.points.length);
      if (this.points.length <= 3){
         return false;
      }
      else {
         this.points.splice(index1,1); //removes point at index 1
      }
   },
   swapPolys: function(){
      var index1 = parseInt(Math.random() * this.points.length);
      var index2 = parseInt(Math.random() * this.points.length);
      var temp = this.points[index2];
      this.points[index2] = this.points[index1];
      this.points[index1] = temp;
   },
   addPoint: function(){
      var index1 = parseInt(Math.random() * this.points.length);
      var direct1 = Math.random() > .5 ? -1 : 1; //moves left or right
      var direct2 = Math.random() > .5 ? -1 : 1; //moves left or right
      var x = this.points[index1][0] + this.size * Math.random() * direct1;
      var y = this.points[index1][1] + this.size * Math.random() * direct2;
      var newPoint = [x,y];
      this.points.splice(index1, 0, newPoint);
   },
   mutateAll: function(alpha_shift, color_shift, move_factor, size_factor, add_point, remove_point, point_shift, swap_chance){
      //mutates traits randomly
      //should it mutate all the traits at once?

      var direct1 = Math.random() > .5 ? -1 : 1; //moves left or right
      var direct2 = Math.random() > .5 ? -1 : 1; //moves left or right
      //color mutation
      //mutate color by color, wraparound
      this.r = checkColor(this.r + parseInt(direct1 * color_shift * Math.random()));
      this.g = checkColor(this.g + parseInt(direct1 * color_shift * Math.random()));
      this.b = checkColor(this.b + parseInt(direct2 * color_shift * Math.random()));
      this.a = checkColor(this.a + parseInt(direct1 * color_shift * Math.random()));
      //alpha mutation
      this.alpha += direct2 * Math.random() * alpha_shift;
      this.alpha = checkAlpha(this.alpha);
      //point mutations
      var expansion = Math.random() * size_factor * direct1; //allow for growing and shrinkage
      var movement = Math.random() * move_factor;

      this.shiftPoints(expansion, point_shift);
      this.moveShape(movement);
      //add point?
      var newPoint = Math.random();
      var removePoint = Math.random();
      var swap = Math.random();
      if (newPoint < add_point){ //flip sign for cool effect
         this.addPoint();
      }
      if (removePoint < remove_point){
         this.removePoint();
      }
      if (swap < swap_chance){
         this.swapPolys();
      }
   },
   render: function(){ //renders the triangle
      this.context.beginPath();
      this.context.globalAlpha = this.alpha;
      for (var i = 0; i < this.points.length; i++){
         this.context.lineTo(this.points[i][0], this.points[i][1]);
      }
      //this.context.lineTo(this.x, this.y);
      this.context.fillStyle = 'rgba(' + this.r + ',' + this.g + ','+ this.b + ',' +
         this.a + ')';
      this.context.fill();
      this.context.closePath();
   },
   scale: function(factor){
      for (var i = 0; i < this.points.length; i++){
         this.points[i][0] = this.points[i][0] * factor;
         this.points[i][1] = this.points[i][1] * factor;
      }
   },
}
