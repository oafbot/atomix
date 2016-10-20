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

declare.namespace('Greetings')
.singleton('Yo')
    .inherits(
        Hello.bind(Hello, 'Yo Yo Yo.')
    );

var Yo = mx.import('Greetings.Yo');
var yo  = new Yo();
var yo2 = new Yo();
console.log(s1===s2);
```