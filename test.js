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


declare
.namespace('Salutations')
.singleton('Yo')
    .inherits(Hello);

var Yo  = mx.import('Salutations.lib.Yo');
var yo  = new Yo('Yo yo yo.');
var yo2 = new Yo();


declare
.ns('Salutations')
.class('Hola')
    .inherits(Singleton)
    .implements(Hello);

mx.from('Salutations').import('Hola').as('Hola');

var hola1 = new Hola('Hola mundo');
var hola2 = new Hola();


Hi = declare.static('Hi', Hello, 'Hi Ho!');
Hi('Hi Ho! Off to work we go!');


space = declare.namespace('Space.lib');

c1 = space.class('Class1');
c2 = space.singleton("Class2");


Atomix
.from('Space') .import('Class1') .as('c3')
.from('Space') .import('Class2') .as('c4')
               .import('Hello')  .as('h1');
port
.from('Salutations') .in('Hola') .as('H1')
.from('Salutations') .in('Yo')   .as('Space.Class3');


(function(){
    var scope = function(){
        Atomix(this)
        .from('Salutations') .in('Hola')   .as('Hola')
        .from('Salutations') .import('Yo') .as('.lib.Yo2');
        var hola = new Hola();
    };

    var closure = new scope();
    var yo3     = new closure.lib.Yo2('Hello');
})();



/*===============================
=            TESTING            =
===============================*/

QUnit.test("Atomix base classes", function( assert ){
    let proton = new Proton();
    let errors = {
        abstract : "Exception: Abstract classes cannot be instantiated.",
    };

    assert.strictEqual( Quark.type,    "abstract", "Quark is an abstract class" );
    assert.throws(function(){return new Quark();}, /Abstract classes cannot be instantiated/,
                                                   "Abstract classes cannot be instantiated");
    assert.strictEqual( proton.type, "base",       "Proton is a base class" );
});

QUnit.test("Atomix.class", function( assert ) {
    assert.ok( hello instanceof Hello,           "hello is instance of Hello" );
    assert.ok( hello instanceof Proton,          "hello is instance of Proton" );
    assert.ok( hello instanceof Quark,           "hello is instance of Quark" );
    assert.strictEqual( hello.type, "class",     'type of s1 is "class"' );
    assert.strictEqual( hello.node, Salutations, 'Hello was exported to namespace "Salutations"' );
});

QUnit.test("Atomix.singleton", function( assert ) {
    assert.ok( s1 instanceof Singleton,         "s1 is instance of Singleton");
    assert.ok( s2 instanceof Singleton,         "s2 is instance of Singleton");
    assert.strictEqual( s1.type, "singleton",   'type of s1 is "singleton"');
    assert.strictEqual( s1 , s2,                "s1 is equal to s2");
    assert.strictEqual( s1.node, Atomix.lib,    "s1 has been exported to default namespace" );

    assert.ok( yo instanceof Singleton,         "yo instance of Singleton" );
    assert.ok( yo2 instanceof Singleton,        "yo2 is instance of Singleton" );
    assert.strictEqual( yo.type, "singleton",   'type of yo is "singleton"');
    assert.strictEqual( yo, yo2,                "yo is equal to yo2");
    assert.notOk( yo instanceof Hello,          "yo is not a direct descendant of Hello");
    assert.ok( yo.instanceof(Hello),            "yo is an indirect descendant of Hello, inherited via mixin" );

    assert.ok( yo instanceof Singleton,         "yo instance of Singleton" );
    assert.ok( yo2 instanceof Singleton,        "yo2 is instance of Singleton" );
    assert.strictEqual( yo.type, "singleton",   'type of yo is "singleton"');
    assert.strictEqual( yo, yo2,                "yo is equal to yo2");
    assert.notOk( yo instanceof Hello,          "yo is not a direct descendant of Hello");
    assert.ok( yo.instanceof(Hello),            "yo is an indirect descendant of Hello, inherited via mixin" );

    assert.ok( hola1 instanceof Singleton,      "hola1 instance of Singleton" );
    assert.ok( hola2 instanceof Singleton,      "hola2 is instance of Singleton" );
    assert.strictEqual( hola1.type,"singleton", 'type of hola1 is "singleton"' );
    assert.strictEqual( hola1, hola2,           "hola1 is equal to hola2" );
    assert.notOk( hola1 instanceof Hello,       "hola1 is not a direct descendant of Hello" );
    assert.ok( hola1.instanceof(Hello),         "hola1 is an indirect descendant of Hello, inherited via mixin" );
});

/*=====  End of TESTING  ======*/