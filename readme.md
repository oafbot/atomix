#Atomix, JS inheritance and class emulation.

**Example for standard class declaration.**
The `Atomix`, `mx`, and `declare` classes are interchangable for the most part.
The declare tool limits functionality to the main business of creating classes,
by mostly aliasing the built in methods baked into the Atomix class. `mx` is
simply the shorthand form of `Atomix`.

```javascript
/* Create a class. */

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
```


**Examples for singleton class declaration.**
Singletons can be created by invoking the 'singleton' method in Atomix or declare.
They can also be created by inheriting from the singleton object or the Singleton constructor.

```javascript
/* Create a singleton class. */

Atomix.new
.singleton('Singularity', function(){
    this.test = "Hello universe.";
    this.init = function(){this.run();};
    this.run  = function(){document.write(this.test + "</br>");};
});

var Singularity = Atomix.import('Singularity');
var s1 = new Singularity();
var s2 = new Singularity();
console.log('singleton:', s1===s2); // true


/* Create a singleton class that inherits from another class. */

declare.namespace('Salutations')
.singleton('Yo')
    .inherits(Hello);

var Yo  = mx.import('Salutations.lib.Yo');
var yo  = new Yo('Yo yo yo.');
var yo2 = new Yo();
console.log('singleton:', yo===yo2); // true


/* Create a singleton by inheritance */

declare
.ns('Salutations')
.class('Hola')
    .inherits(Singleton)
    .implements(Hello);

mx.from('Salutations').import('Hola').as('Hola');

var hola1 = new Hola('Hola mundo');
var hola2 = new Hola();
console.log('singleton:', hola1===hola2); // true
```


**Example for static class declaration**
Static classes can be declared by calling the 'static' method.
By making a class static, creating new instances of the class
will result in an exception being thrown.

```javascript
/* Create a static class */

Hi = declare.static('Hi', Hello, 'Hi Ho!');
Hi('Hi Ho! Off to work we go!');

/* Attempt to create an instance of a static class.
 * The exception : "New instances of static classes may not be constructed."
 * will be thrown.
 */
Fail = new Hi("Fail."); // Exception thrown.
```


**Example for namespace declaration**
Namespaces can be declared by using the namespace method.

```javascript
/* Create a namespace and then declare new classes in that namespace */

space = declare.namespace('Space.lib');
c1 = space.class('Class1');
c2 = space.singleton("Class2");
```


**Examples for importing classes**
The 'Atomix' and 'port' classes can both be used for importing and exporting classes.
The 'port' class adds some exta functionality aside from importing and exporting, such as packaging classes.

```javascript
    /**
     *   The following statements all import the same calss and
     *   assign it to the variable 'H' within the current scope.
     */

    /* standard usage */
    var H = mx.import('Hola');
    var H = mx.import('Salutations.Hola');
    var H = mx.import('Salutations.lib.Hola');

    /* using 'from' and 'as' */
    mx.from('Salutations').import('Hola').as('H');

    /* using 'import' and 'as' */
    mx.import('Salutations.Hola').as('H');

    /* using 'import' and 'as' with namespaces */
    mx.import('Salutations').as('s');
    s.import('Hola').as('H');

    /* standard usage with the 'port' static class */
    var H = port.in('Salutations.Hola');
```