#Atomix, JS inheritance and class emulation.

**examples**

```javascript
Atomix
.class('Hello')
    .inherits(Proton)
    .implements(function(say){
        this.run = function(p){
            document.write(p + "</br>");
        };
        this.run(say);
    }
);

var Hello = Atomix.import('Hello');
var hello = new Hello('Hello world.');


Atomix.new
.singleton('Singularity', function(){
    this.test = "Hello Universe.";
    this.run = function(){
        document.write(this.test + "</br>");
    };
    this.run();
});

var Singularity = Atomix.import('Singularity');
var s1 = new Singularity();
var s2 = new Singularity();
console.log(s1===s2);
```