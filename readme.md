#Atomix, JS inheritance and class emulation.

**examples**

```javascript
Atomix
.ns('Salutations')
.class('Hello')
    .inherits(Proton)
    .implements(function(p){
        this.init = function(p){
            this.run(p);
        };

        this.run = function(p){
            document.write(p + "</br>");
        };
    }
);

var Hello = Atomix.import('Hello');
var hello = new Hello('Hello world.');


Atomix.new
.singleton('Singularity', function(){
    this.test = "Hello universe.";
    this.init = function(){this.run();};
    this.run  = function(){document.write(this.test + "</br>");};
});

var Singularity = Atomix.import('Singularity');
var s1 = new Singularity();
var s2 = new Singularity();
console.log('singleton:', s1===s2);


declare.namespace('Salutations')
.singleton('Yo')
    .inherits(Hello);

var Yo  = mx.import('Salutations.lib.Yo');
var yo  = new Yo('Yo yo yo.');
var yo2 = new Yo();
console.log('singleton:', s1===s2);


declare
.ns('Salutations')
.class('Hola')
    .inherits(Singleton)
    .implements(Hello);

var Hola  = mx.import('Hola');
var hola1 = new Hola('Hola mundo');
var hola2 = new Hola();
console.log('singleton:', hola1===hola2);
```