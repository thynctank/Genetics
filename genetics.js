// TODO: Add tests for all functions, all variations

Genetics = {
  top: window,
  // builds a descendant object
  // overridden functions get wrapped with this._super prop pointing to base func
  // inherits prototype chain
  originate: function(name, def) {
    var top = Genetics.top;
    top[name] = def.init;
    delete def.init;
    top[name].prototype = def;
  },
  inherit: function(parent, name, def) {
    var top = Genetics.top,
        proto,
        prop,
        init;
    if(!def.init)
      init = function() {
        parent.apply(this, arguments);
      };
    else {
      var oldInit = def.init;
      init = function() {
        var tmp = this._super,
            self = this;
        this._super = function(){parent.apply(self, arguments);};
        var ret = oldInit.apply(this, arguments);
        this._super = tmp;
      };
    }
    Genetics.originate(name, {init: init});
    delete def.init;
    top[name].prototype = new parent();
    proto = top[name].prototype;
    for(prop in def) {
      proto[prop] = (typeof def[prop] == "function" && typeof parent.prototype[prop] == "function") ?
        (function(name, func) {
          return function() {
            var tmp = this._super;
            this._super = parent.prototype[prop];
            var ret = func.apply(this, arguments);
            this._super = tmp;
            return ret;
          };
        })(prop, def[prop])
      : def[prop];
    }
  },
  // adds objects' methods/properties (or constructors' prototype methods/properties) to an object's prototype or to an instance.
  // (basically this is mixin behavior)
  splice: function(base, geneSequences) {
    var genes,
        gene,
        i, j;
    if(geneSequences.constructor != Array)
      geneSequences = [geneSequences];
    if(typeof base == "function")
      base = base.prototype;
    
    for(i = 0, j = geneSequences.length; i < j; i++) {
      genes = geneSequences[i];
      if(typeof genes == "function")
        genes = genes.prototype;
      for(gene in genes) {
        var oldGene = base[gene];
        if(typeof genes[gene] == "function" && typeof oldGene == "function") {
          base[gene] = (function() {
            return function() {
              var tmp = this._super;
              this._super = oldGene;
              var ret = genes[gene].apply(this, arguments);;
              this._super = tmp;
              return ret;
            };
          })(gene, genes[gene]);
        }
        else
          base[gene] = genes[gene];
      }
    }
  },
  // generates a new function which calls original function and can perform addl functionality before and/or after the original function
  // before func returns mutated arguments, which are passed into original func and after func
  mutate: function(func, opts) {
    var before, after, args, ret, tmp;
    before = opts.before || function(){return arguments;};
    after = opts.after || function(){};
    return function() {
      tmp = this._result;
      args = before.apply(this, arguments);
      this._result = func.apply(this, args);
      after.apply(this, args);
      ret = this._result;
      this._result = tmp;
      return ret;
    };
  }
};