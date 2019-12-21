
function Climber(target, canvas, max_tris, mutRate, add_rate, breakout){
   this.members = new Array(2); //size 2 array
   this.max_tris = max_tris;
   this.init_tris = 1;
   this.mutRate = mutRate;
   this.canvas = canvas;
   this.context = canvas.getContext('2d');
   this.gen_count = 0;
   this.target = target; //target image
   this.add_rate = add_rate;
   this.curr_winner = [0, 0];  //[current_winners score, current_winners lifespan], used for breakout algorithm
   this.breakout_prob = 0; //assigne based on curr_winner[1] lifespan
   this.breakout = breakout; //is breakout used?

   this.init();
   this.curr_winner[0] = this.members[0].score;
}

Climber.prototype = {
   run: function(){
      this.kill();
      this.clone();
      this.mutate();
      this.score();
      this.sort();
      this.update_breakout();
      this.gen_count++;
   },
   init: function(){
      this.members[0] = this.createMember();
      this.members[1] = this.createMember();
      this.sort();
   },
   mutate: function(){
      var all = false;
      this.members[1].mutate(all);
   },
   score: function(){
      this.members[0].pixel_score();
      this.members[1].pixel_score();
   },
   clone: function(){
      var parent = this.members[0];
      var clone = parent.mate(parent, true); //returns a clone
      this.members[1] = clone;
   },
   kill: function(){ //probably don't need to do this, but it's nice to go through the motions (check garbage collection algorithms)
      this.members[1] = undefined;
   },
   createMember: function(){
      var member = new Member(undefined, this.max_tris, this.init_tris, this.add_rate, this.canvas, this.target, this.mutRate);
      return member;
   },
   sort: function(){
      var breakout = 999; //initalized to never breaking out number
      if (this.breakout){ //if breakout exists
         var breakout = Math.random(); //assigns breakout varaible to usable number
      }
      if (this.members[0].score > this.members[1].score || breakout < this.breakout_prob){
         //sorted based on best result; breakout_prob allows for selection of bad results
         var temp = this.members[0];
         this.members[0] = this.members[1];
         this.members[1] = temp;
      }
   },
   clear: function(){
      this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
   },
   scale: function(factor, canvas){ //makes them larger
      this.members[0].scale(factor);
      this.members[1].scale(factor);
      this.members[0].context = canvas.getContext('2d');
      this.members[1].context = canvas.getContext('2d');
   },
   setGenes: function(genes){
      for (var i = 0; i< this.members.length; i++){
         this.members[i].genes = genes; //hopefully doesn't do a shallow copy
      }
   },
   update_breakout(){
      if (this.members[0].score === this.curr_winner[0]){
         this.curr_winner[1]++;
         //calculate breakout prob
         var arbitrary_denominator = 10000; //for breakout probability
         this.breakout_prob = this.curr_winner[1] / arbitrary_denominator;
      }
      else { //new curr_winner, so probabilities are reset
         this.curr_winner[0] = this.members[0].score;
         this.curr_winner[1] = 0;
         this.breakout_prob = 0;
      }
   },
   toJSON: function(){
      //take all the variables/objects in Climber: [two members: which have arrays of genes, which have arrays of points and colors, and return the raw variable values
      var new_climber = {};
      for(var entry in this){//climber iteration
         if (entry === 'target') continue;
         if (entry === 'context') continue;
         if (entry === 'canvas') continue;
         if (entry == 'members'){ 
            //if a member
            var new_members = [];
            var members = this[entry];
            for (var member_index in members){ //members iteration
               var member = members[member_index];
               var new_member = {};
               for (var m_entry in member){ //so annoying that there are two
                  if (m_entry === 'target') continue;
                  if (m_entry === 'context') continue;
                  if (m_entry === 'canvas') continue;
                  if (m_entry === 'genes'){ //gene iteration
                     var new_genes = [];
                     for (g_index in member[m_entry]){ //will iterate through genes
                        var gene = member[m_entry][g_index];
                        var new_gene = {};
                        for (var g_entry in gene){
                           if (g_entry == 'context') continue;
                           else new_gene[g_entry] = gene[g_entry];
                        }
                        new_genes.push(new_gene);
                     }
                     new_member[m_entry] = new_genes;
                  }
                  else{
                     new_member[m_entry] = member[m_entry]; //base case
                  }
               }
               new_members.push(new_member);
            }
            //now add to the new climber, the array hash
            new_climber[entry] = new_members;
         }
         else{
            new_climber[entry] = this[entry]
         }
      }
      return new_climber;
   },

}
