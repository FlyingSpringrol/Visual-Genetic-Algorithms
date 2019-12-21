
function cloneGenes(geneSet){
   var newGenes = [];
   for (var i = 0; i< geneSet.length; i++){
      var gene = geneSet[i];
      var points = gene.points;
      var newPoints = [];
      for (var j = 0; j < points.length; j++){
         var pointSegment = points[j].slice(0, points[j].length);
         newPoints.push(pointSegment);
      }
      var colors = [gene.r, gene.g, gene.b, gene.a, gene.alpha];
      newGenes[i] = new Gene(gene[0], gene[1], gene.size, gene.context, newPoints, colors);
   }
   return newGenes;
}
function randomRadian(){
   return Math.PI * 2 * Math.random();
}
function findCentroid(pointSet){
   var xSum = 0;
   var ySum = 0;
   for (var i = 0; i < pointSet.length; i++){
      var point = pointSet[i];
      xSum += point[0];
      ySum += point[1];
   }
   var xAve = xSum/pointSet.length;
   var yAve = ySum/pointSet.length;
   return [xAve, yAve];
}
function checkColor(val){
   if (val < 0){
      return 255 + val; //wraparound
   }
   else if (val > 255){
      return val-255; //wraparound
   }
   else return val;
}
function checkAlpha(val){
   if (val < 0) {
      return 1 + val;
   }
   else if (val > 1){
      return val - 1.0;
   }
   else return val;
}
function checkSize(size, min, max){
   if (size < min){
      return (max-min)/2;
   }
   if (size> max){
      return (max-min)/2;
   }
}

//long execution time testing
function testMultiple(iterations, limits, climber, imgDatArray, context, canvas){
   //test multiple climbers?
   for (var i = 0; i < iterations; i++){
      for (var j = 0; j < limits; j++){
         climber.run()
      }
      imgDatArray.push(context.getImageData(0,0, canvas.width, canvas.height));
      climber = new Climber(climber.target, climber.canvas, climber.max_tris,
         climber.mutRate, climber.add_rate, climber.breakout_prob);
      climber.clear();
   }
}

function render(imgDatArray, index){
   context.clearRect(0,0, 1000,1000);
   context.putImageData(imgDatArray[index], 0,0);
}

//the artsy functions
function injectRandomColors(climber, degree, quadrant){
   //the climber is the climber, the degree is the degree, and quadrant will be
   //a quadrant in the square that is the only one affected
   //make some of the triangles random colors
   for (var i = 0; i < climber.members.length; i++){
      var member = climber.members[i];
      for (var j = 0; j < member.genes.length; j++){
         var color_shift = degree;
         var gene = member.genes[j];
         var direct1 = Math.random() > .5 ? -1 : 1; //moves left or right
         var direct2 = Math.random() > .5 ? -1 : 1; //moves left or right
         //color mutation
         //mutate color by color, wraparound
         gene.r = checkColor(gene.r + parseInt(direct2 * color_shift * Math.random()));
         gene.g = checkColor(gene.g + parseInt(direct1 * color_shift * Math.random()));
         gene.b = checkColor(gene.b + parseInt(direct2 * color_shift * Math.random()));
         gene.a = checkColor(gene.a + parseInt(direct1 * color_shift * Math.random()));
      }
   }
}


function scale(factor, canvas, climber, imgObj, context, target){
   //resets target, scales the image
   canvas.width *= factor;
   canvas.height *= factor;
   imgObj.width = canvas.width;
   imgObj.height = canvas.height;
   context = canvas.getContext('2d');
   climber.scale(factor, canvas);
   context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
   var rawTarget = context.getImageData(0,0, canvas.width, canvas.height)
   target = rawTarget.data;
   climber.members[0].target = target;
   climber.members[1].target = target;
   climber.members[0].clear();
   climber.members[0].render();
   return rawTarget;
}

function add_triangles(num, climber){
   climber.max_tris += num;
   climber.members[0].max_size += num;
   climber.members[1].max_size += num;
}

function init_climber(target, canvas, max_tris, mutRate, addRate, breakout){ //modular control of program flow!
   climb = new Climber(target, canvas, max_tris, mutRate, addRate, breakout);
   return climb;
}
function run(climber){
   generation_count++;
   climber.run();
   climber.members[1].render();
}
function loadData(climber, canvas, target, x_size, y_size, j_string){
   /*
   Takes new initialized climber: loads up raw data from j_string
   Explicit copying of variables
   //loadData(climber, canvas, target, 482, 320, one) //example run
   */
   canvas.width = x_size;
   canvas.height = y_size; //to prevent discrepancies in data comparision
   var context = canvas.getContext('2d');
   var climber_info = JSON.parse(j_string);
   var new_members_info = climber_info['members'];
   var members = new_members_info;

   climber.target = target;
   climber.canvas = canvas;
   climber.context = context;

   for (var i = 0; i < members.length; i++){ //use json info to iterate
      var member = climber.members[i];
      var mem_info = members[i];
      member.canvas = canvas;
      member.context = context;
      member.target = target;
      var genes = mem_info['genes']; //little hack to get past weird json export code
      while (member.genes.length < genes.length){ //add container to climber
         member.addGene();
      }
      for (var j = 0; j < genes.length; j++){ //use json info to iterate
         var gene = member.genes[j];
         var gene_info = genes[j];
         gene.r = gene_info.r;
         gene.g = gene_info.g;
         gene.b = gene_info.b;
         gene.a = gene_info.a;
         gene.alpha = gene_info.alpha;
         gene.context = context; 
         gene.points = gene_info.points;
      }
   }
   return climber;
}
function createTarget(imageURL){
   var imageObj = new Image();
   imageObj.src = imageURL;
   context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
   var rawTarget = context.getImageData(0,0, canvas.width, canvas.height);
   target = rawTarget.data;
}
function calculateOffset(x,y){
   var rect = canvas.getBoundingClientRect();
   var point = {x: x-rect.left, y: y-rect.top}
   return point;
}
function setOpacities(climber, direction, degree){
   member1 = climber.members[0];
   member2 = climber.members[1];
   if (direction === 'down'){
      for (var i = 0; i < member1.genes.length; i++){
         member1.genes[i].alpha = member1.genes[i].alpha/ degree
      }
   }
   else if (direction === 'up'){
      for (var i = 0; i < member1.genes.length; i++){
         member1.genes[i].alpha = member1.genes[i].alpha * degree
      }
   }
}
function drawRectangle(context, x, y, x2, y2){
   //draws down to the right by default
   context.globalAlpha = .1;
   context.fillStyle = "black";
   if (x2 < x && y2< y){
      context.fillRect(x2, y2, x-x2, y-y2);
   }
   else if (x2 < x){
      context.fillRect(x2, y, x-x2, y2-y);
   }
   else if (y2 < y){
      context.fillRect(x, y2, x2-x, y-y2);
   }
   else {
      context.fillRect(x, y, x2-x, y2-y);
   }
}

function extract(member, box1, context){
   var genes = [];
   for (var i = 0; i< member.genes.length; i++){
      var points = member.genes[i].points;
      var box2 = createBoundingBox(points, context);
      if (collided(box1, box2)){
         genes.push(member.genes[i]);
      }
   }
   return genes;
}
function collided(rect1, rect2){
   //rect1 = [x1, y1, x2, y2]
      if (rect1[0] < rect2[2] &&
      rect1[2] > rect2[0] &&
      rect1[1] < rect2[3] &&
      rect1[3] > rect2[1]) {
       // collision detected!
       return true;
    }
    else return false;
}
function convertCoordinateSystems(oldWidth, oldHeight, newWidth, newHeight, points){
   //return new points
   xFactor = oldWidth/newWidth;
   yFactor = oldHeight/newHeight;
   for (var i = 0; i < points.length; i++){
      points[i][0] = points[i][0] * xFactor;
      points[i][1] = points[i][1] * yFactor;
   }
   return points;
}
function createBoundingBox(vs, context){ //creates and draws bounding boxes
   //won't create a vertex if the first point initalizes to the max and the min
   maxX = -1;
   maxY = -1;
   minX = 20000;
   minY = 20000;
   for (var j = 0; j< vs.length; j++){
      var point = vs[j];
      if (point[0] > maxX){
         maxX = point[0];
      }
      if (point[0] < minX){
         minX = point[0];
      }
      if (point[1] < minY){
         minY = point[1];
      }
      if (point[1] > maxY){
         maxY = point[1];
      }

   }
   if (context){
      context.fillStyle = 'red';
      context.globalAlpha = .1;
      context.fillRect(minX, minY, maxX-minX, maxY-minY);
   }
   return [minX, minY, maxX, maxY];
}
