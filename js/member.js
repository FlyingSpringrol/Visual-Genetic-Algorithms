
function Member(genes, max_tris, init_number, add_rate, canvas, target, mutRate){ //container class for Genes inside of it
   this.genes = genes;
   this.mutRate = mutRate; //mutation rate
   this.max_size = max_tris; //greatest number of triangles
   this.init_tris = init_number; //should generate the triangles based on generation count
   this.canvas = canvas;
   this.context = canvas.getContext('2d');
   this.target = target; //target imageData
   this.score= 0;
   this.add_rate = add_rate;

   if (genes === undefined){ //undefined genes value
      this.createSomeGenes(this.init_tris); //creates initial triangles
   }
   //used for individual gene mutation, which can be dynamically calculated to improve algorithm
   this.alpha_shift = .05; //max alpha change
   this.color_shift = 10; //max color change
   this.move_factor = 10; //max point movement
   this.size_factor = 30; //max size change
   this.add_point = .008; //probability of adding a point
   this.remove_point = .005;
   this.point_shift_prob = 1; //probability that  point will shift
   this.swap_chance = .02; //probability of swapping in arrays
   this.mut_number = 1;
   this.init_size = 2;
   //score member
   this.pixel_score();
}
Member.prototype = {
   pixel_score: function(){
      this.clear(); //clears canvas
      this.render(); //renders all the triangles
      var imgdat = this.context.getImageData(0,0,this.canvas.width, this.canvas.height);
      var dat = imgdat.data; //get data from canvas
      var score = 0;
      var target = this.target;
      if (target.length != dat.length){
         alert('target error');
         return false;
      }
      for (var i = 0; i< target.length; i+=4){
         //Squared difference of each pixel
         score += Math.pow(dat[i]-target[i],2);
         score += Math.pow(dat[i+1]-target[i+1],2);
         score += Math.pow(dat[i+2]-target[i+2],2);
         score += Math.pow(dat[i+3]-target[i+3],2);
      }
      this.score = score;
      this.checkBoundaries();
   },
   mate: function(otherMember, wantClone){
      if (this.genes.length > this.max_size || otherMember.genes.length > this.max_size){
         return null;
      }
      if (wantClone){ //used for the hillclimbing algorithm
         var newGenes = cloneGenes(this.genes);
         return new Member(newGenes, this.max_size, this.init_tris, this.add_rate, this.canvas, this.target, this.mutRate);
      }

      var pivot1 = parseInt(this.genes.length/2-1);
      var genes1 = this.genes.slice(0,pivot1).concat(otherMember.genes.slice(pivot1, otherMember.genes.length));
      var genes2 = otherMember.genes.slice(pivot1, otherMember.genes.length).concat(this.genes.slice(0, pivot1));
      checkCross(otherMember.genes.length, genes2);
      checkCross(this.genes.length, genes1);
      var child1 = new Member(genes1, this.max_size, this.init_tris, this.add_rate, this.canvas, this.target, this.mutRate);
      var child2 = new Member(genes2, this.max_size, this.init_tris, this.add_rate, this.canvas, this.target, this.mutRate);
      return [child1, child2];
   },
   mutate: function(){
         for (var i = 0; i < this.mut_number; i++){
            var index = parseInt(Math.random() * this.genes.length);
            var mut = Math.random();
            var add = Math.random();
            if (mut > this.mutRate){
               //mutateAll params
               this.genes[index].mutateAll(this.alpha_shift, this.color_shift, this.move_factor,
                  this.size_factor, this.add_point, this.remove_point, this.point_shift_prob,
                  this.swap_chance);
            }
            if (add > (this.add_rate) && this.genes.length < this.max_size){ //add gene conditional
               this.addGene();
            }
         }
         if (add > (this.add_rate) && this.genes.length < this.max_size){ //add gene conditional
            this.addGene();
         }
   },
   render: function(){
      for (var i = 0; i< this.genes.length; i++){
         this.genes[i].render();
      } //renders all the triangles
      var imgdat = this.context.getImageData(0,0,this.canvas.width, this.canvas.height);
      this.clear();
      this.context.putImageData(imgdat, 0,0);
   },
   checkBoundaries: function(){
      for (var i = 0; i < this.genes.length; i++){
         for (var j = 0; j < this.genes[i].points.length; j++){
            var point = this.genes[i].points[j];
            if (point[0] < 0 || point[0] > this.canvas.width
               || point[1] < 0 || point[1] > this.canvas.height){
                  this.score += 100000;
            }
         }
      }
   },
   clear: function(){
      this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
   },
   cutTail: function(amount){
      var len = this.genes.length;
      if (len - amount < 0){
         alert('wrong length in cutTail');
         return false;
      }
      this.genes.splice(len-amount, amount);
   },
   createSomeGenes: function(number){
      this.genes = [];
      for (var i = 0; i< number; i++){
         this.addGene();
      }
   },
   addGene: function(){
      var x = Math.random() * this.canvas.width;
      var y = Math.random() * this.canvas.height;
      var gene = new Gene(x, y, this.init_size, this.context);
      this.genes.push(gene);
   },
   scale: function(factor){ //used to scale image
      for (var i = 0; i < this.genes.length; i++){
         var gene = this.genes[i];
         gene.scale(factor);
      }
   },
}
