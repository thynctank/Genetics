Pseudo-classes
==============
Creating a new class using Genetics is as simple as calling Genetics.originate(), passing in a class name as a string, and passing in an object (the class definition) with an init method, which becomes the constructor, and any additional methods you'd like added to the prototype. Once this is complete you can instantiate the class using new as you normally would. Any parameters passed in to the constructor will be passed on to the init.

*Example*:

    Genetics.originate("Box", {
      init: function(label) {
        this.label = label;
      },
      getLabel: function() {
        return this.label;
      }
    });
    
    var a = new Box("toys");
    a.getLabel(); //"toys"

Inheriting
==========
Genetics allows you to inherit new pseudo-class objects from any class created by Genetics, or from any simple constructor/prototype combo. Call Genetics.inherit(), passing in the parent pseudo-class object as the first param, the new class's name as a string, and a class definition object as you would with Genetics.originate(). Any methods already defined on the parent class will be overridden, but parent methods may be accessed by calling this._super() from within the overridden method. This applies to init/constructors as well.

*Example*:

    Genetics.inherit(Box, "SecureBox", {
      init: function(label) {
        var secretLabel = label;
        this.getLabel = function(pass) {
          if(pass == "totallysecurepassword")
            return secretLabel;
          else
            return "Nothing. I swear!"
        }
      }
    });
    
    var b = new SecureBox("candy");
    b.getLabel(); //"Nothing. I swear!"
    b.getLabel("totallysecurepassword"); //"candy"

Mutating functions
==================
Genetics enables you to perform complex "currying" of JS functions, performing transformations on the arguments which are passed in to the original function, as well as applying similar transformations on the result returned by the original function. To mutate a function, pass in the original function, and an options object. This options object may contain before and after members. The *before* function takes the arguments passed in to the final, mutated function, and should return an arguments object to pass along to the original function. It should therefore ensure that the arguments passed along match the expected arguments for that original function. The *after* function accepts the arguments returned by the *before* (if a *before* was used, else it takes the unmodified arguments) and is bound to whatever the original function is bound to, allowing it access to the temporary this._result variable, which contains the intermediary result passed back by the original function. The *after* is free to modify this._result, which is then returned by the final mutated function.

*Example*:

    function myLog(str) {return str;}
    b.introspectionLog = Genetics.mutate(myLog, {
      before: function() {
        return {
          type: typeof arguments,
          data: arguments
        }
      },
      after: function() {
        console.log(this._result)
      }
    });
    b.log("Instrospect this!"); //console.log output varies, returns complex object instead of string
    
Splicing
========
Here's where Genetics gets interesting while remaining awesomely simple. You can mix in single functions, or all the methods of an object or class, all using Genetics.splice(). First pass in the base object or class you'd like to splice into, then pass in any of the following: a function, an array of functions, a class/constructor function, or an array of same. Genetics will ensure that your base, be it an instance object or a class, is augmented with all of the methods passed in to it, including those available on the object literals or prototypes of classes passed in.

*Example*:

    o = {name: "Bob"};
    function Shooter() {}
    Shooter.prototype.shoot = function() {
      return "BANG!";
    };
    
    Flyer = {
      fly: function() {
        return "I can fly!";
      }
    };
    
    Genetics.splice(o, [Shooter, Flyer]);
    o.shoot(); //"BANG!"
    o.fly(); //"I can fly!"