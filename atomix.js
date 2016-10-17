/**
 * Atomix, Class Emulation for Javascript.
 * @param  {object} global    Current scope [global in most cases].
 * @return {void}
 */
(function(global){
    global.Atomix;
    global.Proton;
    global.Singleton;
    global.Interface;

    global.declare;
    global.namespace;
    global.mx;

    var nsref,
        nsget,
        exp,
        lib,
        atomix,
        _base_,
        _exports_,
        _namespace_,
        _namespaces_,
        Quark,
        Metadata,
        Constructor;

    exp = function Exports(){};
    lib = function Library(){};

    _exports_    = new lib();
    _namespace_  = null;
    _namespaces_ = [];

    /**
     * Retrieve namespaced object. Create empty object if it does not exist.
     * @param  {object} context
     * @param  {array}  namespaces
     * @return {object}
     */
    nsref = function(context, namespaces){
        for(var i=0; i<namespaces.length; i++){
            if(typeof context[namespaces[i]] === 'undefined'){
                if(namespaces[i]==='lib'){
                    context[namespaces[i]] = new lib();
                }
                else{
                    var name = Interface(namespaces[i]);
                    var ns = new name();
                    context[namespaces[i]] = ns;
                }
            }
            context = context[namespaces[i]];
        }
        return context;
    };

    /**
     * Retrieve namespaced object from string representing import path.
     * @param  {string} nsstring    A string representing the namespaced path.
     * @return {object}             Namespaced object.
     */
    nsget = function(nsstring){
        var context = global;
        var namespaces = nsstring.split(".");

        for(var i=0; i<namespaces.length; i++){
            if(namespaces[i]!==""){
                if(typeof context[namespaces[i]] === 'undefined'){
                    throw "Exception: Namespace '" + nsstring + "' does not exist.";
                }
                context = context[namespaces[i]];
            }
        }
        return context;
    };

    /**
     * Create a unimplemented constructor for a new named object prototype.
     * @param {string} name    The name of the constructor / new prototype object.
     */
    Interface = function(name){
        return (eval("( function(){ return function " + name + "(){}; })"))();
    };

    /**
     * Create a constructor with applied context for a new named object prototype.
     * @param {string}   name
     * @param {Function} fn
     */
    Constructor = function(name, fn){
        return (eval("( function(call){ return function " + name +
            "(){ return call(this, arguments); }; })"))(fn.apply.bind(fn));
    };

    /**
     * Create a metadata object that can be attached to other objects.
     * @param {object} opts    Properties for the metaobject definition.
     */
    Metadata = function Metadata(opts){
        opts = opts || {};
        for(let i in opts){
            if(opts.hasOwnProperty(i))
                this[i] = opts[i];
        }
    };

    /**
     * Base object definition and constructor.
     */
    Quark = function(){
        /**
         * Metadata associated with the object.
         * @type {Metadata}
         */
        this._meta_ = new Metadata({
            name : 'Quark',
            info : 'Quark Object',
            ns   : _exports_
        });

        /**
         * Standard toString implementation.
         * @return {string}    String represenation of the Object.
         */
        this.toString = function(){
            if(typeof this._meta_.name==='undefined')
                this._meta_.name = 'Quark';
            return '[object ' + this._meta_.name +']';
        };

        /**
         * Create a child object that inherits from this object.
         * @param  {string} name    Name of the child object
         * @param  {object} opts    Configuration options and metadata.
         * @return {function}       Constructor for the child object.
         */
        this.decendant = function(name, opts){
            var meta, fn, proto, parent;
            proto  = Object.getPrototypeOf(this);
            parent = proto.constructor;

            opts = (typeof opts!=='undefined') ? opts : {};
            opts.name = name;
            opts.info = (typeof opts.info==='undefined') ? name + " Object" : opts.info;
            meta = new Metadata(opts);

            fn = Interface(name);
            fn.prototype = Object.create(this);
            fn.prototype.constructor = fn;
            fn.prototype.constructor.prototype = fn.prototype;
            fn.prototype._meta_ = meta;
            fn.prototype._super_ = function(...args){
                parent.call(this);
                if(args.length && typeof args[args.length-1]==='function'){
                    var code = args.pop();
                    code.call(this, ...args);
                    this.augment(code, this);
                }
                return this;
            };
            fn.prototype.export(this._meta_.ns);
            return fn;
        };

        /**
         * Proxy object for metadata retreival.
         * @param  {object} obj
         * @return {mixed}
         */
        this.proxy = function(obj){
            return  new Proxy(obj, {
                get: function(target, name){
                    if(!(name in target)){
                        var metatag = name.replace(/(^_+|_+$)/mg, '');
                        if(metatag in target._meta_)
                            return target._meta_[metatag];
                        return undefined;
                    }
                    return target[name];
                }
            });
        };

        /**
         * Child object inherits properies from the parent object via mixin.
         * @param  {object} parent
         * @param  {object} child
         * @return {object} child
         */
        this.augment = function(parent, child){
            for(let i in parent){
                if(parent.hasOwnProperty(i))
                    child[i] = parent[i];
            }
            this.export(this._meta_.ns);
            return child;
        };
        this.extend = this.augment;

        /**
         * Define object's inheritance.
         * @param  {object} parent    Parent object that this will inherit from.
         * @return {object}           The redefined context for this object.
         */
        this.inherits = function(parent){
            var child;

            if(parent instanceof Singleton.constructor ||
               parent.prototype instanceof Singleton.constructor){
                var c, p, f;

                p = (parent instanceof Singleton.constructor) ? parent : parent.prototype;
                c = p.decendant(this._meta_.name, this._meta_);
                c = new c();

                f = (function(){
                    var instance;
                    return function(){
                        if(typeof instance!=='undefined')
                            return instance;
                        instance = this;
                    };
                });

                child = Interface(this._meta_.name);
                child.prototype = c;
                child.prototype.constructor = Constructor(c._meta_.name, f());
                child.prototype.constructor.prototype = c;
                child.prototype.export(c.exports);
                return new child();
            }
            else if(parent instanceof Quark){
                child = parent.decendant(this._meta_.name, this._meta_);
                return new child();
            }
            else if(parent.prototype instanceof Quark){
                parent = new parent();
                child = parent.decendant(this._meta_.name, this._meta_);
                return new child();
            }
            return this.augment(parent, this);
        };
        this.extends = this.inherits;

        /**
         * The implementation for a new object 'class'.
         * @param  {function} mixin    A function that adds functionality and defines the object.
         * @return {function}          The constructor to create the redefined object.
         */
        this.define = function(mixin){
            var self = this;
            var proto = Object.getPrototypeOf(self);

            proto.constructor = function(...args){
                var func = function(...args){self._super_(mixin.bind(self, ...args));};
                var fn = Constructor(self._meta_.name, func.bind(...args));
                fn.prototype = self;
                fn.prototype.constructor = fn;
                return new fn(...args);
            };
            proto.constructor = Constructor(this._meta_.name, proto.constructor);
            proto.constructor.prototype = proto;
            proto.export(self._meta_.ns);
            return this.constructor;
        };
        this.implements = this.define;
        this.employs = this.define;

        /**
         * Export the object to a namespace.
         * @param  {object} ns    The namespaced object to export to.
         * @return {string}       String representation of the namespaced object path.
         */
        this.export = function(ns){
            let name = this._meta_.name;
            let dest = "";

            if(_namespace_!==_exports_ && _namespace_!==null){
                ns = _namespace_;
                delete _exports_[name];
            }
            if(ns===undefined)
                ns = this._meta_.ns;
            else if(ns!==undefined)
                this._meta_.ns = ns;

            ns = (ns.hasOwnProperty('lib')) ? ns.lib : ns;
            ns[name] = this.constructor;

            dest = (ns===_exports_) ? 'Atomix.exports' : dest;
            dest = (ns.hasOwnProperty('lib')) ? dest + ".lib" : dest;
            dest = (dest==="" && ns!==global) ? ".." : dest;

            if(dest.substring(0, 2)!=='..' && _namespaces_.indexOf(dest)<0)
                _namespaces_.push(dest);
            return dest + '.' + name;
        };
    };
    Quark.prototype = new Quark('Quark', {info:'Quark Object'});

    /**
     * Proton. Base Object for Atomix inheritance.
     * @type {Proton}
     */
    Proton = Quark.prototype.decendant('Proton', {info:'Proton Object'});
    _base_ = new Proton();

    /**
     * Creates a base singleton object all singletons may inherit from.
     * @return {Singleton}    Base Singleton Object.
     */
    Singleton = (function(){
        var instance, singleton, s, fn;
        singleton = Proton.prototype.decendant('Singleton');
        s = new singleton();

        Singleton = function Singleton(){
            if(typeof instance!=='undefined')
                return instance;
            instance = Object.create(this);
            fn = Interface('Singleton');
            fn.prototype = instance;
            fn.prototype.constructor = fn;
            fn.prototype.constructor.prototype = instance;
            instance = new fn();
        };

        Singleton.call(s);
        return new Singleton();
    })();

    /**
     * Atomix constructor.
     * @type {Proton}
     */
    atomix = _base_.decendant('Atomix', {info:'Atomix Object'});

    /**
     * Method to create an Atomix class.
     * @param  {string} name    Name of the new class to be created.
     * @param  {mixed}  args    Optional implementation function and options.
     * @return {object}         Instance of the class constructor.
     */
    atomix.prototype.class = function Atomixer(name, ...args){
        var child, Child, opts, implementation, namespaces, ns, glb;
        namespaces = (name.indexOf('.') > -1) ? name.split(".") : [name];

        if(namespaces.length>0)
            name = namespaces.pop();

        context = (this._namespace_===null) ? global : this._namespace_;
        context = (namespaces.length>0 || this._namespace_!==null) ? context : this.exports;
        ns = nsref(context, namespaces);

        for(var i=0; i<args.length; i++){
            if(typeof args[i]==='object')
                opts = args[i];
            if(typeof args[i]==='function')
                implementation = args[i];
        }

        opts   = (typeof opts==='undefined') ? {} : opts;
        parent = (typeof opts.parent==='undefined') ? _base_ : opts.parent;
        Child  = parent.decendant(name, opts);
        child  = new Child();

        child.export(ns);

        if(typeof implementation!=='undefined')
            return child.define(implementation);

        return child;
    };

    /**
     * Method to export a class constructor to a namespace.
     * @param  {mixed}  ns      The namespace to export to (string or object).
     * @param  {string} name    Register the object under this name in the namespace.
     * @return {string}         The string representation of the namespace path.
     */
    atomix.prototype.export = function(ns, name){
        var fn = this.exports[name];
        var dest = (ns===this.exports && typeof ns!=='string') ? "Atomix.exports" : "";

        if(typeof ns==='string'){
            dest = ns;
            namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
            ns = nsref(global, namespaces);
        }
        if(ns!==this.exports){
            if(!ns.hasOwnProperty('lib'))
                ns.lib = new lib();
            ns.lib[name] = fn;

            dest = (dest==="" && ns!==global) ? ".." : dest;
            dest += '.lib';
        }
        if(dest.substring(0, 2)!=='..' && atomix.prototype.namespaces.indexOf(nspath)<0)
            atomix.prototype.namespaces.push(dest);
        return dest + '.' + name;
    };

    /**
     * Method to import object from supplied import path and known namespaces.
     * @param  {string} name    Name of object or namespaced path.
     * @return {mixed}          Object or function requested.
     */
    atomix.prototype.import = function(name){
        if(name.indexOf('.') > -1){
            return nsget(name);
        }
        else if(this.exports.hasOwnProperty(name))
            return this.exports[name];
        else{
            var ns, nspath;
            for(var i=0; i<this.namespaces.length; i++){
                nspath = this.namespaces[i];
                ns = nsget(nspath);
                if(ns.hasOwnProperty(name))
                    return ns[name];
                if(ns.hasOwnProperty('lib')&&ns.lib.hasOwnProperty(name))
                    return ns.lib[name];
            }
            throw "Exception: Object '" + name + "' not found.";
        }
    };

    /**
     * Method to import and create a new object of type [name] with supplied arguments applied on constructor.
     * @param  {string} name    Name of the constructor / object type.
     * @param  {mixed}  args    Arguments to be passed into the object constructor.
     * @return {object}         New object of type [name].
     */
    atomix.prototype.build = function(name, ...args){
        var constructor = (_namespace_) ? _namespace_[name] : this.exports[name];
        return new constructor(...args);
    };

    /**
     * Method to perform a lazy import then create a new object of type [name]. Apply arguments on constructor.
     * @param  {string} name    Name of the constructor / object type.
     * @param  {mixed}  args    Arguments to be passed into the object constructor.
     * @return {object}         New object of type [name].
     */
    atomix.prototype.autobuild = function(name, ...args){
        var constructor = this.import(name);
        return new constructor(...args);
    };

    /**
     * Property-method to reset the Atomix class constructor.
     * @return {Atomix}
     */
    atomix.prototype.new = (function(){
        Object.defineProperty(atomix.prototype, "new", {
            get: function(){
                this._namespace_ = null;
                _namespace_ = null;
                return this;
            }
        });
    })();

    /**
     * Method to define a namespace for the constructor to be stored in.
     * @param  {mixed} ns    Namespace as actual object or as string representation.
     * @return {Atomix}      Atomix Object.
     */
    atomix.prototype.ns = function(ns){
        var namespaces, nsstring;
        if(ns===null || typeof ns==='undefined' || ns===_exports_){
            _namespace_ = null;
            Atomix._namespace_ = null;
            return Atomix;
        }

        if(typeof ns==='string'){
            if(_namespaces_.indexOf(ns)<0)
                _namespaces_.push(ns);
            namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
            ns = nsref(global, namespaces);
        }
        if(!ns.hasOwnProperty('lib'))
            ns.lib = new lib();

        Atomix._namespace_ = ns;
        _namespace_ = ns;
        return Atomix;
    };

    /**
     * Method to create a singleton type object by inheriting from the Atomix Singleton Object.
     * @param  {string}   name              Name of the new singleton.
     * @param  {function} implementation    Object definition to apply to constructor.
     * @return {object}                     New object derived from the base singleton.
     */
    atomix.prototype.singleton = function(name, implementation){
        var s, fn, funx, constructor;

        s = Singleton.decendant(name);
        s = new s();
        s._meta_.name = name;
        s._meta_.info = name + ' Object';

        funx = (function(){
            var instance;
            return function(){
                if(typeof instance!=='undefined')
                    return instance;
                instance = this;
                if(implementation)
                    implementation.call(instance);
            };
        });

        fn = Interface(name);
        fn.prototype = s;
        fn.prototype.constructor = Constructor(name, funx());
        fn.prototype.constructor.prototype = Singleton;
        fn.prototype.export(this.exports);
        return new fn();
    };

    /**
     * Method to create a namespace.
     * @param  {string} name    The namespace in dot notation.
     * @return {array}          Array containing registered namespaces.
     */
    atomix.prototype.namespace = function Namespace(name){
        var fn,
            ns,
            space,
            nspath,
            namespaces;

        nspath = name;
        namespaces = (name.indexOf('.') > -1) ? name.split(".") : [name];
        name = namespaces.pop();
        ns = nsref(global, namespaces);
        fn = Interface(name);
        space = new fn();
        ns[name] = space;
        if(Atomix.namespaces.indexOf(nspath)<0)
            Atomix.namespaces.push(nspath);
        return Atomix.namespaces;
    };

    /**
     * Method to convert string representation of a namespaced path to an object.
     * @param  {string} name    String representation of namespace.
     * @return {object}         Namespaced object.
     */
    atomix.prototype.unpack = function(name){
        var namespaces, ns;
        namespaces = name.split(".");
        name = namespaces.pop();
        ns = nsget(namespaces.join('.'));
        return ns[name];
    };

    /*
     * Global convenience functions.
     * Comment out these shortcuts if you desire to
     * limit global scope pollution
     */
    declare   = atomix.prototype.new.class;
    namespace = atomix.prototype.namespace;
    singleton = atomix.prototype.singleton;

    /* Convenience functions. */
    atomix.prototype.c     = atomix.prototype.build;     // import and build
    atomix.prototype.gimp  = atomix.prototype.unpack;    // global import
    atomix.prototype.limp  = atomix.prototype.import;    // lazy import
    atomix.prototype.blimp = atomix.prototype.autobuild; // lazy import and build

    /* Global instance of Atomix */
    Atomix             = new atomix();
    Atomix.exports     = _exports_;
    Atomix._namespace_ = _namespace_;
    Atomix.namespaces  = _namespaces_;
    mx                 = Atomix;

    /* Freeze global instance of Atomix Object. */
    Object.freeze(Proton);
    Object.freeze(Atomix);
    Object.freeze(Atomix._meta_);
    Object.preventExtensions(Atomix);
})(this);