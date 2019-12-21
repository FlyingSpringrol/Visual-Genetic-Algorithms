
function Population(populationSize, mutRate, elitism, canvas, tris, targetData){
   this.members = []; //members
   this.gen_count = 0; //generation count
   this.populationSize = populationSize; //# of members
   this.mutRate = mutRate; //mutation rate for members
   this.crossoverRate = 1; //always cross over while mating?
   this.target = targetData; //target image data? (as ImageData object)
   this.elitism = elitism; //number survived, should change as generations progress

   this.canvas = canvas;
   this.context = canvas.getContext('2d');
   this.tris = tris; //number of tris in a member
   this.init_tris = 10; //used to intialize members

   this.createMembers();
   this.sort();

}
Population.prototype = {
   step_gen: function(){
      this.sort();
      this.kill();
      this.fill();
      var new_children = this.populationSize/2; //number of children, would be nice to dynamically generate
      this.mate(new_children);
      this.mutate();
      this.score();
      this.gen_count++;
   },
   score: function(){
      for (var i = 0; i < this.members.length; i++){
         this.members[i].pixel_score();
      }
   },
   createMembers: function(){
      for (var i = 0; i< this.populationSize; i++){
         var mem = new Member(undefined, this.tris, this.init_tris, this.canvas, this.target, this.mutRate);
         this.members.push(mem);
      }
   },
   sortFunk: function(a,b){
      if (a.score > b.score){
         return 1;
      }
      else if (a.score < b.score){
         return -1;
      }
      else return 1; //in case of ties
   },
   sort: function(){
      this.members.sort(this.sortFunk);
   },
   kill: function(){ //becomes
      var survived = parseInt(this.elitism * this.populationSize);
      for (var i = 0; i< this.members.length; i++){
         if (i > survived){
            //console.log('set undefined')
            this.members[i] = undefined;
         }
      }
   },
   fill: function(){
      for (var i = 0; i< this.members.length; i++){
         if (this.members[i]==undefined){
            //console.log('detected an undefined value')
            console.log('member created');
            this.members[i] = this.createMember();
         }
      }
   },
   mutate: function(){ //Population mutation code
      for (var i = 0; i< this.members.length; i++){
         this.members[i].mutate();
      }
   },
   mate: function(idealChildren){
      var cutoff = parseInt(this.elitism * this.populationSize);
      var i = 0;
      //for some reason this fills up the entire members array? why
      var max_tries = 0;
      while (this.members.length-cutoff > i+1){ //cutoff has to be even?
         var idx = parseInt(Math.random()*cutoff); //selects a random member
         var other = parseInt(Math.random()*cutoff); //selects another member
         if (idealChildren === 1){
            alert('beware the infinite loop');
            return false;
         }
         while (idx === other){
            other = parseInt(Math.random()*cutoff); //no self mating
         }
         var kids = this.members[idx].mate(this.members[other]); //returns two kids
         max_tries++;
         if (!kids){
            if (max_tries < 20){ //tries to mate again
               continue;
            }
            //this part executes when max tries > to fill undefined kids array;
            else {
               kids = [this.createMember(), this.createMember()];
               max_tries = 0;
            }
         }
         this.members[cutoff+i+1] = kids[0];
         this.members[cutoff+i+2] = kids[1];
         i+=2;
      }

   },
   createMember: function(){
      var member = new Member(undefined, this.tris, this.init_tris, this.canvas, this.target, this.mutRate);
      return member;
   },
   clear: function(){
      this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
   },
   check_population: function(){ //checking for undefined members, and broken members
      for (var i = 0; i< this.members.length; i++){
         var member = this.members[i];
         if (this.members[i] === undefined){
            console.log('broken: ' + i);
         }
         for (var j = 0; j< member.genes.length; j++){
            if (member.genes[j] === undefined || member.genes[j]=== NaN){
               console.log('broken: '+ j);
            }
         }
         if (member.score < 100000){
            return true;
         }
      }
      return false;
   },
   check_solved: function(ideal){
      if (this.members[0].score < ideal){
         return true;
      }
      else return false;
   }

}
