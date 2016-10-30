/**
 * Atomix, Class Emulation for Javascript.
 * @param  {object} global    Current scope [global in most cases].
 * @return {void}
 */
(function(global){
    'use strict';
    var e,
        f,
        f1,
        f2,
        exp,
        lib,
        util,
        nsref,
        nsget,
        Atomix,
        Ports,
        Quark,
        Proton,
        Singleton,
        singleton,
        Metadata,
        Interface,
        Constructor,
        Factory,
        ClassFactory,
        PortsManager,
        mx,
        port,
        quark,
        atomix,
        proton,
        append,
        declare,
        factory,
        singleton,
        quarklike,
        revpath,
        _nmsp_,
        _util_,
        _stat_,
        _spaces_,
        _exports_;

    exp  = function Exports(){};
    lib  = function Library(){};
    util = function Utility(){};

    e  = eval;
    f  = function(name, s){if(s==f1||s==f2){s=s.replace("<name>", name);return e(s);}
        throw "Exception: Faulty constructor.";};
    f1 = "(function(call){return function <name>(){return call(this, arguments);};})";
    f2 = "(function(){return function <name>(){};})";

    _exports_ = new lib();
    _util_    = new lib();
    _stat_    = new lib();
    _nmsp_    = null;
    _spaces_  = [];

    /**
     * Recursevely register the lookup paths for the namespace up to the global scope.
     * @param  {object} ns    The namespaced object.
     * @return {void}
     */
    revpath = function(ns){
        var name;

        while(ns!==global){
            name = ns.name || "";

            if(name==="" && ns.constructor.name=='Library')
                name = 'lib';

            if(!ns.path && ns.parent && ns.parent.path && name)
                ns.path = ns.parent.path + "." + name;

            if(ns.parent!==undefined)
                ns = ns.parent;
            else
                ns = global;
        }
    };

    /**
     * Retrieve namespaced object. Create empty object if it does not exist.
     * @param  {object} context
     * @param  {array}  namespaces
     * @return {object}
     */
    nsref = function(context, namespaces){
        var i,
            ns,
            path,
            name;

        path = (context===global) ? "" : context.constructor.name;

        for(i=0; i<namespaces.length; i++){
            if(typeof context[namespaces[i]] === 'undefined'){
                if(namespaces[i]==='lib'){
                    context[namespaces[i]] = new lib();
                }
                else if(namespaces[i]==='static'){
                    context[namespaces[i]] = new lib();
                }
                else if(namespaces[i]==='util'){
                    context[namespaces[i]] = new lib();
                }
                else{
                    name = Interface(namespaces[i]);
                    ns = new name();
                    context[namespaces[i]] = ns;
                }
            }
            path += (context===global) ? namespaces[i] : "." + namespaces[i];
            context[namespaces[i]].path   = path;
            context[namespaces[i]].parent = context;
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
        var i,
            context    = global,
            namespaces = nsstring.split(".");
        for(i=0; i<namespaces.length; i++){
            if(namespaces[i]!==""){
                if(typeof context[namespaces[i]] === 'undefined')
                   throw "Exception: Namespace '" + nsstring + "' does not exist.";
                context = context[namespaces[i]];
            }
        }
        if(context===global)
            throw "Exception: Namespace '" + nsstring + "' does not exist.";
        return context;
    };

    /**
     * Append functionality to an object or constructor post factum.
     * @param  {mixed}    target     Object or constructor
     * @param  {...mixed} args       Name of property and function to be appended.
     * @return {mmixed}              Object or constructor that has been altered.
     */
    append = function(target, ...args){
        var i,
            fn,
            name,
            proto,
            targeted;

        for(i=0; i<args.length; i++){
            if(typeof args[i]==='string')
                name = args[i];
            if(typeof args[i]==='function')
                fn = args[i];
        }

        if(typeof target=='object'){
            proto = Object.getPrototypeOf(target);
            targeted = (proto!==Object.prototype) ? proto : target;
            fn = fn.bind(target);
        }
        if(typeof target=='function'){
            //target.bind(target.prototype);
            fn = fn.bind(target.prototype);
            targeted = target;
        }

        if(name && !targeted.hasOwnProperty(name))
            targeted[name] = fn;
        else if(fn.name && !targeted.hasOwnProperty(name))
            targeted[fn.name] = fn;
        else if(targeted.hasOwnProperty(name)){
            //target[name] = target[name].bind();
            return target;
        }
        else
            throw "Exception: Anonymous function passed. Property assignements needs to be named.";

        return target;
    };

    /**
     * Create a unimplemented constructor for a new named object prototype.
     * @param {string} name    The name of the constructor / new prototype object.
     */
    Interface = function Interface(name){return f(name, f2)();};

    /**
     * Create a constructor with applied context for a new named object prototype.
     * @param {string}   name
     * @param {Function} fn
     */
    Constructor = function Constructor(name, fn){return (f(name, f1))(fn.apply.bind(fn));};

    /**
     * Create a metadata object that can be attached to other objects.
     * @param {object} opts    Properties for the metaobject definition.
     */
    Metadata = function Metadata(opts, host){
        var i,
            prop,
            getset;

        opts = opts || {};
        getset = function(prop, i){
                Object.defineProperty(Object.getPrototypeOf(host), prop, {
                    get: function(){
                        return this.meta(i);
                    },
                    set: function(value){
                        prop = value;
                    },
                    configurable: true
                });
        };

        for(i in opts){
            if(opts.hasOwnProperty(i)){
                this[i] = opts[i];
                if(i=="name") this.class = opts[i];
            }
            if(host!==undefined && host._meta_!==undefined){
                if(i=="name")
                    getset("_class_", i);
                else if(i!="parent"){
                    prop = "_"+i+"_";
                    getset(prop, i);
                }
            }
        }
    };

    /**
     * Base object definition and constructor.
     */
    Quark = function(){
        var propfn,
            _proto_ = Object.getPrototypeOf(this);

        /**
         * Factory for dynamic properties.
         * @param  {string}   prop      Property name
         * @param  {function} getter    function definition for the getter
         * @return {mixed}
         */
        propfn = (function(prop, getter){
            Object.defineProperty(this, prop, {
                get: getter,
                set: function(){prop = propfn.call(this);},
                configurable: true
            });
        }).bind(this);

        /**
         * Sort the constructor arguments by type.
         * @param  {array}  args    The arguments passed into the constructor.
         * @return {object}         Object containing the sorted constructor arguments.
         */
        this.args = function(){
            var i,
                ns,
                args,
                path,
                name,
                options,
                resolve,
                namespaces,
                implementation;

            args = Array.from(arguments);

            resolve = function(name){
                if(_exports_[name]!==undefined)
                    return 'Atomix.exports.lib.' + name;
                else if(global[name]!==undefined)
                    return name;
                return name;
            };

            for(i=0; i<args.length; i++){
                if(typeof args[i]==='object')
                    options = args[i];
                if(typeof args[i]==='function')
                    implementation = args[i];
                if(typeof args[i]==='string')
                    name = args[i];
            }

            name       = (name===undefined) ? this.constructor.name : name;
            path       = (name.indexOf('.') > -1) ? name : resolve(name);
            namespaces = (path.indexOf('.') > -1) ? path.split(".") : [path];
            name       = namespaces.pop();
            ns         = this.meta('ns') || nsref(global, namespaces);

            return {
                ns             : ns,
                name           : name,
                path           : path,
                options        : options,
                implementation : implementation
            };
        };

        /**
         * Return type of the constructor.
         * @return {string}
         */
        this.gettype = function(){
            return (this.constructor.hasOwnProperty('type')) ? this.constructor.type : null;
        };

        /**
         * Metadata associated with the object.
         * @type {Metadata}
         */
        this._meta_ = new Metadata({
            name   : 'Quark',
            info   : 'Quark Object',
            ns     : _exports_,
            parent : Object.prototype,
            type   : 'class'
        }, this.proto);

        /**
         * Throw exception if abstract class is called.
         * @return {void}
         */
        this.init = function(){
            if(this instanceof this.constructor && this.constructor.type=='abstract')
                throw "Exception: Abstract classes cannot be instantiated.";
            this._meta_.type='abstract';
            if(!this.gettype()) this.constructor.type='abstract';
        };

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
         * Return the name of the object instance's class if no param is passed
         * Else check inheritance chain
         * @param  {mixed} query    Check against this value
         * @return {mixed}          Boolean if comparison value is passed.
         *                          Else string representation of the class.
         */
        this.instanceof = function(query){
            var q,
                ns;
            if(query===undefined){
                if(this._meta_.name)
                    return this._meta_.name;
                else if(this.constructor.name)
                    return this.constructor.name;
                else if(this===null)
                    return "Null";
                return this.toString.call(this).slice(8, -1);
            }
            else if(typeof query=='string'){
                if(query.indexOf('.') > -1){
                    ns  = query.split(".");
                    query = ns.pop();
                    ns = ns.join(".");
                    ns = nsget(ns);
                }
                else if(typeof this._meta_.ns!='undefined'){
                    ns = this._meta_.ns;
                }
                else{
                    ns = global;
                }
                if(ns[query]!==undefined)
                    return this.instanceof(ns[query]);
                else{
                    if(this.ancestors.list.indexOf(query)>-1)
                        return true;
                }
                return false;
            }
            else if(typeof query=='object'){
                return this instanceof query.constructor;
            }
            else if(typeof query=='function'){
                if(this instanceof query)
                    return true;
                else if(typeof this._meta_.mixin!='undefined' && this._meta_.mixin instanceof query)
                    return true;
                else if(this.ancestors.list.indexOf(query.name)>-1)
                    return true;
                return false;
            }
        };

        /**
         * Get the parent that this class is a decendant of.
         * @return {object}
         */
        this.parent = propfn("parent", function(){
            var o,
                proto;

            proto = Object.getPrototypeOf(this);
            if(proto instanceof Quark)
                return proto._meta_.parent;
            o = Object.create(Object.prototype);
            o.name = Object.name;
            return o;
        });

        /**
         * Get the Inheritance chain.
         * @return {array}
         */
        this.ancestors = propfn('ancestors', function(){
            var i,
                o,
                proto,
                rents,
                parents,
                getlist;

            proto   = Object.getPrototypeOf(this);
            parents = [this];
            rents   = Object.getPrototypeOf(parents);

            getlist = (function(prop, getter){
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: function(){prop = propfn.call(this);},
                    configurable: true
                });
            }).bind(parents);

            rents.list = getlist('list', function(){
                var list = [];
                parents.forEach(function(e,i,a){
                    if(typeof e.name!='undefined')
                        list.push(e.name);
                    else if(typeof e=='object')
                        list.push(e.constructor.name);
                });
                return list;
            });

            if(proto instanceof Quark){
                while(proto instanceof Quark){
                    if(typeof proto._meta_.parent!=='undefined')
                        parents.push(proto._meta_.parent);
                    if(typeof proto._meta_.mixin!=='undefined')
                        parents.push(proto._meta_.mixin);
                    proto = Object.getPrototypeOf(proto._meta_.parent);
                }
                parents.push(Object.prototype);
                return parents;
            }
        });

        /**
         * Get the name of the class.
         * @return {string}
         */
        this.name = propfn('name', function(){
            if(typeof this._meta_!=='undefined')
                return this._meta_.name;
            return this.name;
        });

        /**
         * Get data in the metadata object.
         * @return {mixed}
         */
        this.meta = function(prop){
            if(typeof prop==='undefined')
                return this._meta_;
            return this._meta_[prop];
        };

        /**
         * Alias for Object.getPrototypeOf. Standin for __proto__.
         * @return {object}     Prototype of the object.
         */
        this.proton = propfn('proton', function(){
            return Object.getPrototypeOf(this);
        });

        /**
         * Create a child object that inherits from this object.
         * @param  {string} name    Name of the child object
         * @param  {object} opts    Configuration options and metadata.
         * @return {function}       Constructor for the child object.
         */
        this.decendant = function(name, opts){
            var fn,
                meta,
                child,
                proto,
                parent;

            proto  = Object.getPrototypeOf(this);
            parent = proto.constructor;

            opts = (typeof opts!=='undefined') ? opts : {};
            opts.name = name;
            opts.info = (typeof opts.info==='undefined') ? name + " Object" : opts.info;
            opts.type = (typeof opts.type==='undefined') ? "class" : opts.type;
            meta = new Metadata(opts, proto);

            fn = Interface(name);
            fn.prototype = Object.create(this);
            fn.prototype.constructor = fn;
            fn.prototype.constructor.prototype = fn.prototype;
            fn.prototype._meta_ = meta;
            fn.prototype._super_ = function(...args){
                var p,
                    code,
                    proto;

                parent = parent.bind(this);
                p = new parent();
                if(args.length && typeof args[args.length-1]==='function'){
                    code = args.pop();
                    code.call(this, ...args);
                    this.augment(code, this);
                }
                proto = Object.getPrototypeOf(this);
                proto._meta_.parent = p;
                return this;
            };
            fn.prototype.export(this._meta_.ns);
            fn.prototype._meta_.parent = this;
            child = new fn();
            return child.constructor;
        };
        this.derive = this.decendant;

        /**
         * Child object inherits properies from the parent object via mixin.
         * @param  {object} parent
         * @param  {object} child
         * @return {object} child
         */
        this.augment = function(parent, child){
            var proto = Object.getPrototypeOf(child);
            for(let i in parent){
                if(!child.hasOwnProperty(i) && typeof child[i]=='undefined')
                    if(i!=='_meta_')
                       proto[i] = parent[i];
                if(i=='init' && !proto.hasOwnProperty(i))
                    proto[i] = parent[i];
            }
            child.export(child._meta_.ns);
            if(typeof parent!=='function')
                child._meta_.mixin = parent;
            return child;
        };
        this.extend = this.augment;

        /**
         * Define object's inheritance.
         * @param  {object} parent    Parent object that this will inherit from.
         * @return {object}           The redefined context for this object.
         */
        this.inherits = function(parent){
            var c,
                f,
                p,
                child,
                mixed,
                proto,
                instance;

            if(this instanceof Singleton){
                proto = Object.getPrototypeOf(this);

                if(typeof parent==='object'){
                    proto = proto.augment(parent, proto);
                }
                else if(typeof parent==='function'){
                    proto.constructor = proto.implements(parent);
                    proto = proto.augment(parent, proto);
                }
                proto._meta_.mixin = parent;
                return proto;
            }

            if(parent instanceof Singleton ||
               parent.prototype instanceof Singleton){
                p = (parent instanceof Singleton) ? parent : parent.prototype;
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
                child.prototype._meta_.parent = this;
                child.prototype._meta_.mixin  = parent.prototype;
                return new child();
            }
            else if(parent instanceof Quark){
                child = parent.decendant(this._meta_.name, this._meta_);
                child.prototype._meta_.parent = parent;
                return new child();
            }
            else if(parent.prototype instanceof Quark){
                parent = new parent();
                child  = parent.decendant(this._meta_.name, this._meta_);
                child.prototype._meta_.parent = parent;
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
        this.implements = function(mixin){
            var self   = this,
                proto  = Object.getPrototypeOf(self),
                parent = self.parent;

            if(this.instanceof(singleton)){
                return atomix.prototype.singleton.call(self, self._meta_.name, mixin).constructor;
            }

            proto.constructor = function(...args){
                var fn,
                    func;

                func = function(...args){self._super_(mixin.bind(self, ...args));};
                fn = Constructor(self._meta_.name, func.bind(self,...args));
                fn.prototype = self;
                fn.prototype.constructor = fn;
                fn.prototype.constructor.prototype = self;
                self = new fn();

                if(self.init!==undefined)
                    self.init.call(self, ...args);

                return self;
            };
            proto.constructor = Constructor(this._meta_.name, proto.constructor);
            proto.constructor.prototype = proto;
            proto.export(self._meta_.ns);

            return self.constructor;
        };
        this.employs = this.implements;

        /**
         * Export the object to a namespace.
         * @param  {object} ns    The namespaced object to export to.
         * @return {string}       String representation of the namespaced object path.
         */
        this.export = function(ns){
            var name,
                dest,
                scope,
                nsstring,
                namsespaces;

            nsstring = (typeof ns=='object' && ns.constructor.name!="Library"  && ns!=global) ? ns.constructor.name : "";
            name = this._meta_.name;
            dest = (typeof ns==='string') ? ns : nsstring;
            dest = (typeof ns!=='undefined' && typeof ns.path!=='undefined') ? ns.path : dest;

            if(this._meta_.ns===undefined){
                if(typeof ns==='string'){
                    namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
                    ns = nsref(global, namespaces);
                    delete _exports_[name];
                    _nmsp_ = null;
                }
                else if(_nmsp_!==_exports_ && _nmsp_!==null){
                    ns = _nmsp_;
                    delete _exports_[name];
                }
                if(ns!==undefined)
                    this._meta_.ns = ns;
            }
            else if(this._meta_.ns){
                ns = this._meta_.ns;
                if(this._meta_.ns!==_exports_){
                    delete _exports_[name];
                }
            }

            ns = (ns.hasOwnProperty('lib')) ? ns.lib : ns;
            ns[name] = this.constructor;

            dest = (ns===_exports_) ? 'Atomix.exports.lib'    : dest;
            dest = (ns===_util_)    ? 'Atomix.exports.util'   : dest;
            dest = (ns===_stat_)    ? 'Atomix.exports.static' : dest;
            dest = (ns.hasOwnProperty('lib')) ? dest + '.lib' : dest;
            dest = (dest==="" && ns!==global) ? ".." : dest;

            if(dest.substring(0, 2)!=='..' && _spaces_.indexOf(dest)<0 && dest!==""){
                _spaces_.push(dest);
                _spaces_.sort();
            }

            if(!ns.path)
                this._meta_.path = dest + '.' + name;

            if(ns.path===undefined)
                ns.path = (dest!='..') ? dest : "";

            //console.log(name, this._meta_.ns!==_exports_ , this._meta_.ns, _nmsp_)

            return dest + '.' + name;
        };

        this.init();
    };

    quark = new Quark('Quark', {info:'Quark Object'});
    Quark.prototype = quark;

    /**
     * Proton. Base Object for Atomix inheritance.
     * @type {Proton}
     */
    Proton = quark.decendant('Proton', {info:'Proton Object', type:'base'});
    proton = new Proton();
    Proton.prototype = proton;

    /**
     * Creates a base singleton object all singletons may inherit from.
     * @return {Singleton}    Base Singleton Object.
     */
    singleton = (function(){
        var s,
            fn,
            instance,
            singleton;

        s = Proton.prototype.decendant('Singleton');
        s = new s();
        s._meta_.type = 'singleton';

        Singleton = function Singleton(){
            if(typeof instance!=='undefined')
                return instance;
            instance = Object.create(this);
            instance._meta_.type = 'singleton';
            fn = Interface('Singleton');
            fn.prototype = instance;
            fn.prototype.constructor = fn;
            fn.prototype.constructor.prototype = instance;
            instance = new fn();
        };

        Singleton = Constructor('Singleton', Singleton);
        Singleton.call(s);
        singleton = new Singleton();
        Singleton.prototype = singleton;
        Singleton.prototype.constructor = Singleton;
        Singleton.prototype.constructor.prototype = singleton;
        return singleton;
    })();

    /**
     * Atomix constructor.
     * @type {Proton}
     */
    atomix = proton.decendant('Atomix', {info:'Atomix Object', ns:_util_, type:'utility'});

    /**
     * Derive the name, configuration, namespace, and implementation for the new class.
     * @param  {string} name    Name of the new class (may be a dot delimited namespace path).
     * @param  {mixed} args     The remaining arguments passed into the class constructor.
     * @return {object}         Object with the processed data.
     */
    atomix.prototype.process = function(name, args){
        var i,
            ns,
            opts,
            context,
            nsstring,
            namespaces,
            implementation;

        nsstring = name;

        for(i=0; i<args.length; i++){
            if(typeof args[i]==='object')
                opts = args[i];
            if(typeof args[i]==='function')
                implementation = args[i];
        }

        opts = (typeof opts==='undefined') ? {} : opts;
        namespaces = (name.indexOf('.') > -1) ? name.split(".") : [name];
        namespaces = namespaces.filter(function(n){return n!==undefined && n!=="";});

        if(namespaces.length>0){
            name     = namespaces.pop();
            nsstring = namespaces.join('.');
        }

        if(opts.hasOwnProperty('ns')){
            ns = opts.ns;
            if(ns.hasOwnProperty('path') && nsstring.indexOf(ns.path)>-1){
                context    = ns;
                nsstring   = nsstring.substr(0+ns.path.length, ns.path.length);
                nsstring   = nsstring.replace(/^(\.)/, "");
                namespaces = nsstring.split('.').filter(function(n){ return n!==undefined && n!=="";});
                ns         = nsref(context, namespaces);
                opts.ns    = ns;
            }
        }
        else{
            context = (this.nmsp===null) ? global : this.nmsp;
            context = (namespaces.length>0 || this.nmsp!==null) ? context : this.exports.lib;
            ns      = nsref(context, namespaces);
            opts.ns = ns;
        }

        return {
            name : name,
            opts : opts,
            ns   : ns,
            implementation : implementation
        };
    };

    /**
     * Method to create an Atomix class.
     * @param  {string} name    Name of the new class to be created.
     * @param  {mixed}  args    Optional implementation function and options.
     * @return {object}         Instance of the class constructor.
     */
    atomix.prototype.class = function Atomixer(name, ...args){
        var p,
            child,
            Child;

        p = atomix.prototype.process(name, args);

        parent = (typeof p.opts.parent==='undefined') ? proton : p.opts.parent;
        Child  = parent.decendant(p.name, p.opts);
        child  = new Child();

        child.export(p.ns);
        //atomix.prototype.export(ns, name);
        if(typeof p.implementation!=='undefined')
            return child.implements(p.implementation);
        return child;
    };

    /**
     * Method to create a singleton type object by inheriting from the Atomix Singleton Object.
     * @param  {string}   name              Name of the new singleton.
     * @param  {function} implementation    Object definition to apply to constructor.
     * @return {object}                     New object derived from the base singleton.
     */
    atomix.prototype.singleton = function(name, ...args){
        var p,
            s,
            fn,
            funx,
            instance;

        p = atomix.prototype.process(name, args);
        s = singleton.decendant(p.name);
        s = new s();
        s._meta_        = new Metadata(p.opts, Object.getPrototypeOf(s));
        s._meta_.name   = p.name;
        s._meta_.info   = p.name + ' Object';
        s._meta_.parent = singleton;
        s._meta_.type   = 'singleton';

        funx = (function(){
            var fn,
                imp,
                instance,
                implementation;

            return function(...args){
                if(typeof instance!=='undefined')
                    return instance;
                instance = this;

                if(p.implementation){
                    implementation = p.implementation.bind(p.implementation, ...args);
                    imp = new implementation();
                    if(imp.hasOwnProperty('init'))
                        imp.init.call(imp, ...args);
                    instance = instance.augment(imp, instance);
                    return instance;
                }
                return instance;
            };
        });

        fn = Interface(p.name);
        fn.prototype = s;
        fn.prototype.constructor = Constructor(p.name, funx());
        fn.prototype.constructor.prototype = s;
        instance = new fn();
        instance.export(p.ns);
        return instance;
    };

    /**
     * Method to export a class constructor to a namespace.
     * @param  {mixed}  ns      The namespace to export to (string or object).
     * @param  {string} name    Register the object under this name in the namespace.
     * @return {string}         The string representation of the namespace path.
     */
    atomix.prototype.export = function(ns, name, fn){
        var dest,
            namespaces;

        fn   = (fn===undefined) ? this.exports.lib[name] : fn;
        dest = (ns===this.exports.lib && typeof ns!=='string') ? "Atomix.exports.lib" : "";

        if(typeof ns==='string'){
            dest = ns;

            switch(dest){
                case 'Atomix.exports.static':
                    ns = _stat_;
                    break;
                case 'Atomix.exports.util':
                    ns = _util_;
                    break;
                default:
                    namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
                    ns = nsref(global, namespaces);
                    break;
            }
        }

        if(this.exports!==ns && _exports_!==ns && _stat_!==ns && _util_!==ns){
            if(!ns.hasOwnProperty('lib'))
                ns.lib = new lib();

            ns.lib[name] = fn;

            dest = (dest==="" && ns!==global) ? ".." : dest;
            dest += '.lib';
        }
        else if(_stat_===ns || _util_===ns || _exports_===ns){
            ns[name] = fn;
        }
        else if(this.exports===ns){
            ns.lib[name] = fn;
        }
        else{
            throw "Exception: Constructor not exported.";
        }

        if(dest.substring(0, 2)!=='..' && this.namespaces.indexOf(dest)<0 && dest!==""){
            this.namespaces.push(dest);
            this.namespaces.sort();
        }

        //if(ns!==_exports_)
        //   delete _exports_[name];

        return dest + '.' + name;
    };

    /**
     * Method to import object from supplied import path and known namespaces.
     * @param  {string} name    Name of object or namespaced path.
     * @return {mixed}          Object or function requested.
     */
    atomix.prototype.import = function(name){
        var i,
            c,
            f,
            ns,
            nspath,
            dotpath;

        f = function(path){return function(name){ return e('var ' + name + " = "+path+";"); };};

        /* If the requested import is a namespace */
        try{
            if(name.indexOf('.') < 0 && typeof nsget(name)=='object'){
                c = nsget(name);
                f = f(name);
                c = append(c, 'as', f);
                c = append(c, 'import', atomix.prototype.import);
                return c;
            }
        }
        catch(e){
            /* pass */
        }
        /* Else if the requested import is a constructor */
        if(name.indexOf('.') > -1){
            try{
                c = nsget(name);
                f = f(name);
                c = append(c, 'as', f);
                c = append(c, 'import', atomix.prototype.import);
                return c;
            }
            catch(e){
                dotpath = name.split(".");
                name = dotpath.pop();
                name = dotpath.join('.') + ".lib." + name;
                c = nsget(name);
                f = f(name);
                c = append(c, 'as', f);
                c = append(c, 'import', atomix.prototype.import);
                return c;
            }
        }
        else if(_exports_.hasOwnProperty(name)){
            c = _exports_[name];
            f = f('Atomix.exports.lib.'+name);
            c = append(c, 'as', f);
            c = append(c, 'import', atomix.prototype.import);
            return c;
        }
        else{
            for(i=0; i<_spaces_.length; i++){
                nspath = _spaces_[i];
                ns = nsget(nspath);
                if(ns.hasOwnProperty(name)){
                    c = ns[name];
                    f = f(nspath+"."+name);
                    c = append(c, 'as', f);
                    c = append(c, 'import', atomix.prototype.import);
                    return c;
                }
                if(ns.hasOwnProperty('lib') && ns.lib.hasOwnProperty(name)){
                    c = ns.lib[name];
                    f = f(nspath+".lib."+name);
                    c = append(c, 'as', f);
                    c = append(c, 'import', atomix.prototype.import);
                    return c;
                }
            }
            throw "Exception: Object '" + name + "' not found.";
        }
    };

    /**
     * Import namespace.
     * @param  {string} path    The fully qualified path to namespace.
     * @return {object}         Return namespace with additional functionality.
     */
    atomix.prototype.from = function(path){
        var c, ns;
        ns = nsget(path);
        ns = append(ns, 'import', function(name){
            c = atomix.prototype.import(path+"."+name);
            //delete ns.import;
            return c;
        });
        return ns;
    };

    /**
     * Method to import and create a new object of type [name] with supplied arguments applied on constructor.
     * @param  {string} name    Name of the constructor / object type.
     * @param  {mixed}  args    Arguments to be passed into the object constructor.
     * @return {object}         New object of type [name].
     */
    atomix.prototype.build = function(name, ...args){
        var constructor;
        constructor = (_nmsp_) ? _nmsp_[name] : this.exports.lib[name];
        constructor = constructor.bind(this, ...args);
        return new constructor();
    };

    /**
     * Method to perform a lazy import then create a new object of type [name]. Apply arguments on constructor.
     * @param  {string} name    Name of the constructor / object type.
     * @param  {mixed}  args    Arguments to be passed into the object constructor.
     * @return {object}         New object of type [name].
     */
    atomix.prototype.autobuild = function(name, ...args){
        var constructor;
        constructor = this.import(name);
        constructor = constructor.bind(this, ...args);
        return new constructor();
    };

    /**
     * Property-method to reset the Atomix class constructor.
     * @return {Atomix}
     */
    atomix.prototype.reset = function(){
        var prop = 'new';
        Object.defineProperty(this, prop, {
            get: function(){
                this.nmsp      = null;
                _nmsp_         = null;
                return this;
            },
            set: function(){
                prop = this.reset.call(this);
            },
            configurable: true
        });
    };

    /**
     * Method to define a namespace for the constructor to be stored in.
     * @param  {mixed} ns    Namespace as actual object or as string representation.
     * @return {Atomix}      Atomix Object.
     */
    atomix.prototype.ns = function(ns){
        var nsstring,
            namespaces;

        if(ns===null || typeof ns==='undefined' || ns===_exports_){
            _nmsp_ = null;
            Atomix.nmsp = null;
            return Atomix;
        }

        if(typeof ns==='string'){
            if(_spaces_.indexOf(ns)<0){
                _spaces_.push(ns);
                _spaces_.sort();
            }
            namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
            ns = nsref(global, namespaces);
        }

        if(!ns.hasOwnProperty('lib') && !(ns instanceof lib)){
            ns.lib = new lib();
            ns.lib.parent = ns;
            revpath(ns.lib);
        }

        Atomix.nmsp = ns;
        _nmsp_ = ns;

        return Atomix;
    };

    /**
     * Method to create a namespace.
     * @param  {string} name    The namespace in dot notation.
     * @return {array}          Array containing registered namespaces.
     */
    atomix.prototype.namespace = function(name){
        var i,
            fn,
            ns,
            opts,
            funx,
            space,
            nspath,
            instance,
            namespaces,
            implementation;

        try{
            ns = nsget(name);
            if(ns.type!==undefined && ns.type=="namespace"){
                return ns;
            }
            return atomix.prototype.ns(ns);
        }
        catch(e){
            nspath     = name;
            namespaces = name.indexOf('.') > -1 ? name.split(".") : [name];
            name       = namespaces.pop();
            ns         = nsref(global, namespaces);

            funx = function(){
                var i,
                    args,
                    classname;
                args = Array.from(arguments);
                classname = "";

                for(i=0; i<args.length; i++){
                    if(typeof args[i]==='object')
                        opts = args[i];
                    if(typeof args[i]==='function')
                        implementation = args[i];
                    if(typeof args[i]==='string')
                        classname = args[i];
                }

                opts      = (typeof opts==='undefined') ? {} : opts;
                opts.ns   = ns[name];
                opts.type = 'namespace';

                atomix.prototype.nmsp = ns[name];
                instance = this.call(atomix.prototype, classname, opts, implementation);

                if(ns[name]!==_exports_)
                    delete _exports_[classname];

                return instance;
            };

            fn = Interface(name);
            fn.prototype.class     = funx.bind(atomix.prototype.class);
            fn.prototype.singleton = funx.bind(atomix.prototype.singleton);
            fn.prototype.namespace = funx.bind(atomix.prototype.namespace);
            fn.prototype.static    = funx.bind(atomix.prototype.static);
            fn.prototype.path      = nspath;
            fn.prototype.type      = 'namespace';

            space        = new fn();
            space.path   = nspath;
            space.parent = ns;

            for(i in ns[name]){
                if(ns[name].hasOwnProperty(i))
                    space[i] = ns[name][i];
            }
            ns[name] = space;

            if(_spaces_.indexOf(nspath)<0){
                _spaces_.push(nspath);
                _spaces_.sort();
            }

            //atomix.prototype.nmsp = null;
            return ns[name];
        }
    };

    /**
     * Method to convert string representation of a namespaced path to an object.
     * @param  {string} name    String representation of namespace.
     * @return {object}         Namespaced object.
     */
    atomix.prototype.unpack = function(name){
        var ns,
            namespaces;

        namespaces = name.split(".");
        name = namespaces.pop();
        ns = nsget(namespaces.join('.'));
        return ns[name];
    };
    atomix.prototype.parse = atomix.prototype.unpack;

    /**
     * Method to convert string representation of a namespaced path to an namespace and classname.
     * @param  {string} name    String representation of namespace.
     * @return {array}         Namespace object and name of class.
     */
    atomix.prototype.splitns = function(name){
        var ns,
            namespaces;

        namespaces = name.split(".");
        name = namespaces.pop();
        ns = nsget(namespaces.join('.'));
        return [ns, name];
    };

    /**
     * Parse a string, object, or a constructor into a class, string or constructor
     * @param  {mixed} _class_    Class representation: object, function or string.
     * @param  {string} _type_    Type to return... String, object or function.
     * @return {mixed}            The representation of the class.
     */
    atomix.prototype.parsec = function(_class_, _type_){
        var fn;
        if(typeof _class_==="function"){
            if(_type_===undefined || _type_=='constructor' || _type_=='function')
                return _class_;
            else if(_type_=='instance' || _type_=='object')
                return new _class_();
        }
        else if(typeof _class_==="string"){
            fn = this.import.call(this, _class_);
            if(_type_===undefined || _type_=='constructor' || _type_=='function')
                return fn;
            else if(_type_=='instance' || _type_=='object')
                return new fn();
        }
        else if(typeof _class_==="object"){
            if(_type_===undefined || _type_=='constructor' || _type_=='function')
                return _class_.constructor;
            else if(_type_=='instance' || _type_=='object')
                return _class_;
        }
        else if(_class_===undefined){
            throw "Exception: Class undefined.";
        }
        throw "Exception: Unknown class.";
    };

    /**
     * Create a static class.
     * @param  {string} name       Name to be assigened to the class
     * @param  {mixed}  _class_    Optional class to be derived from.
     * @param  {mixed}  args       Optional parameters for initialization.
     * @return {function}          Instance of the static class.
     */
    atomix.prototype.static = function(name, _class_, ...args){
        var a,
            c,
            i,
            f,
            n,
            fn,
            atmx,
            nonstat,
            error;

        atmx  = atomix.prototype;
        error = "Exception: New instances of static classes may not be constructed.";

        if(_class_===undefined || _class_===null || _class_===''){
            if(this.nmsp===null)
                atomix.prototype.ns('Atomix.exports.static');
            c = atomix.prototype.class(name, {type:'static'}, ...args);
            _class_ = c.constructor;
        }
        else{
            _class_ = atomix.prototype.parsec(_class_);
        }

        if(true===(this instanceof global.constructor || this instanceof atmx.static)){
            throw error;
        }
        else if(true===this instanceof ClassFactory || this===atmx){
            try{
                if(false===this.instanceof(_class_)){
                    f = _class_;
                    f = f.bind.apply(f, [f].concat(args));
                    i = new f();
                    i = Object.create(i);
                    f = i.decendant(i.name);
                    f = f.bind(f, ...args);
                    i = new f();

                    name = name || i.constructor.name;

                    fn = Constructor(name, i.constructor);
                    fn.prototype = i;
                    fn.prototype.constructor = fn;
                    fn.prototype.constructor.prototype = fn.prototype;
                    fn.bind(fn, ...args);

                    n = new fn();
                    n.constructor = function(){
                       throw error;
                    };
                    n.init = i.init;
                    f = function(...a){
                        if((this!==undefined && this.constructor===f) || (this===f && this.constructor===f))
                            throw error;
                        else if(a.length==1 && a[0]===null)
                            return  n;
                        else if(n.init!==quark.init)
                            (a) ? n.init.call(n, ...a) : n.init.call(n, ...args);
                        return (a) ? atmx.static.call(n, name, fn, ...a) : atmx.static.call(n, name, fn, ...args);
                    };

                    Atomix.export("Atomix.exports.static", name, f);
                    return f;
                }
            }
            catch(e){
                console.warn(e);
                return (true===this instanceof _class_) ? this : this.call(global, name, _class_, ...args);
            }
        }
        return this;
    };

    /* Convenience functions.
     * c     :  Import and build.
     * gimp  :  Global import.
     * limp  :  Lazy import.
     * blimp :  Lazy import and build.
     */
    atomix.prototype.c     = atomix.prototype.build;
    atomix.prototype.gimp  = atomix.prototype.unpack;
    atomix.prototype.limp  = atomix.prototype.import;
    atomix.prototype.blimp = atomix.prototype.autobuild;

    /* Global instance of Atomix */
    Atomix                = new atomix();
    Atomix.nmsp           = _nmsp_;
    Atomix.namespaces     = _spaces_;
    Atomix.exports        = new exp();
    Atomix.exports.lib    = _exports_;
    Atomix.exports.static = _stat_;
    Atomix.exports.util   = _util_;
    Atomix.lib            = Atomix.exports.lib;
    Atomix.util           = Atomix.exports.util;
    Atomix.stat           = Atomix.exports.static;
    Atomix.exports.path   = "Atomix.exports";
    Atomix.lib.path       = "Atomix.exports.lib";
    Atomix.stat.path      = "Atomix.exports.static";
    Atomix.util.path      = "Atomix.exports.util";
    Atomix.lib.parent     = Atomix.exports;
    Atomix.stat.parent    = Atomix.exports;
    Atomix.util.parent    = Atomix.exports;
    mx                    = Atomix;
    atomix.prototype      = Atomix;
    Atomix.new            = Atomix.reset.call(Atomix);

    Factory =
    Atomix.class('Factory', {type:'utility', ns:Atomix.exports.util})
        .implements(function(){
            this.init = function(factory){
                if(typeof factory=='function')
                    return factory();
            };
            return this.init();
        }
    );

    ClassFactory =
    Atomix.class('ClassFactory', {type:'utility', ns:Atomix.exports.util})
        .inherits(Factory)
        .implements(function(factory){
            return this.init(factory);
        }
    );

    /* Global convenience function. */
    declare = (function(factory){
        var def,
            fabrik;
        def           = new util();
        def.class     = function(...args){ return Atomix.new.class(    ...args); };
        def.singleton = function(...args){ return Atomix.new.singleton(...args); };
        def.namespace = function(...args){ return Atomix.new.namespace(...args); };
        def.static    = function(...args){ return Atomix.new.static(   ...args); };
        def.ns        = function(...args){ return Atomix.new.ns(       ...args); };
        fabrik        = function(       ){ return factory.augment(def, factory); };

        return new ClassFactory(fabrik);
    })(ClassFactory.prototype);

    /* Global convenience function for import - export. */
    Ports = function(){
        /**
         * Reset Atomix.
         * @return {void}
         */
        this.init = function(){
            Atomix = Atomix.new;
        };

        this.from = function(path){
            var pkg = this.pkg(path);
            return pkg;
        };

        /**
         * Import a class constructor from a namespaced library.
         * @param  {string} path
         * @return {function}
         */
        this.in = function(path){
            var c;
            try{
                c = nsget(path);
            }
            catch(e){
                c = Atomix.new.import(path);
            }

            return c;
        };

        /**
         * Export the class constructor to a namespaced library.
         * @param  {...mixed} args     String: export path, function: constructor, boolean: delete other referances.
         * @return {string}            Namespace path to object.
         */
        this.out = function(...args){
            var i,
                ns,
                del,
                path,
                constructor;

            ns = new Array(2);

            for(i=0; i<args.length; i++){
                if(typeof args[i]==='string')
                    path = args[i];
                if(typeof args[i]==='function')
                    constructor = args[i];
                if(typeof args[i]==='boolean')
                    del = args[i];
            }

            if(constructor===undefined || constructor===null)
                throw "Exception: Invalid parameter. Missing constructor.";
            if(typeof constructor!='function')
                throw "Exception: Invalid type. Constructors have to be functions.";

            del = (del===undefined) ? true : del;

            if(path)
                ns = Atomix.splitns(path);
            else{
                if(path===null || path===undefined || path===""){
                    ns[0] = Atomix.exports.lib;
                    if(constructor.hasOwnProperty('name'))
                        ns[1] = constructor.name;
                    else throw "Exception: Anonymous Constructors cannot be assigned to a namespace." +
                        "\nExplicityly assign a name by passing a value into the namespace parameter.";
                }
            }
            if(del && constructor.prototype instanceof Quark && constructor.prototype._meta_.ns!==ns[0]){
                if(constructor.prototype._meta_.ns.hasOwnProperty('lib') &&
                   constructor.prototype._meta_.ns.lib[ns[1]]!==undefined)
                    delete constructor.prototype._meta_.ns.lib[ns[1]];
                else
                    delete constructor.prototype._meta_.ns[ns[1]];

                constructor.prototype._meta_.ns = ns[0];
            }
            return Atomix.new.export(ns[0], ns[1], constructor);
        };

        /**
         * Copy a class constructor from one namespace to another (copies are by referance not deep copy).
         * @param  {string} orig    Original location of constructor.
         * @param  {string} dest    Destination of constructor.
         * @return {string}         Namespaced path.
         */
        this.cp = function(orig, dest){
            var fn = this.in(orig);
            this.out(dest, fn, false);
        };

        /**
         * Move a class constructor from one namespace to another (old referance is deleted).
         * @param  {string} orig    Original location of constructor.
         * @param  {string} dest    Destination of constructor.
         * @return {string}         Namespaced path.
         */
        this.mv = function(orig, dest){
            var fn = this.in(orig);
            this.out(dest, fn);
        };

        /**
         * Delete a class constructor from a library.
         * @param  {string} address    The path to the constructor.
         * @return {object}            The namespace that the constructor was deleted from.
         */
        this.rm = function(address){
            var ns,
                name,
                namespaces;
            namespaces = address.split('.');
            name = namespaces.pop();
            address = namespaces.join(".");
            ns = nsget(address);
            if(ns.hasOwnProperty('lib')&&ns.lib.hasOwnProperty(name))
                delete ns.lib[name];
            else
                delete ns[name];
            return ns;
        };

        /**
         * List all known classes and return in desired format.
         * @param  {string} dir       Directory to list. May be a namespaced path, "*", or falsy value.
         * @param  {string} format    Valid params for format are 'flat', '2d', 'object', 'console', 'json'
         * @return {mixed}            'flat' and '2d' return arrays, 'console' outputs to console and returns number,
         *                            'json' returns a JSON string.
         */
        this.ls = function(dir, format){
            var i,
                j,
                d,
                ns,
                name,
                prop,
                dirs,
                list,
                index,
                lookup,
                twodee;

            list = function(ns, name){
                if(ns.hasOwnProperty('lib')){
                    ns = ns.lib;
                    name += ".lib";
                }

                if(format=='console')
                    console.info(name);

                lookup = function(e){return e.namespace==name;};
                twodee = function(e, i){return e[0]==name;};

                for(prop in ns){
                    if(ns.hasOwnProperty(prop) && prop!='parent' && prop!='path'){
                        switch(format){
                            case 'flat':
                                dirs.push(name+"."+prop);
                                break;
                            case '2d':
                                if(dirs.some(twodee)){
                                    index = dirs.findIndex(twodee);
                                    console.log(index);
                                    dirs[index].push(prop);
                                }
                                else{
                                    dirs.push([name, prop]);
                                }
                                break;
                            case 'object':
                                if(!(name in dirs))
                                    dirs[name] = [];
                                dirs[name].push(prop);
                                break;
                            case 'stdio':
                            case 'console':
                                console.log("|-- " + prop);
                                dirs.push(name+"."+prop);
                                break;
                            case 'json':
                                d = dirs.filter(lookup);
                                if(d.length<1){
                                    dirs.push({namespace:name, members:[prop]});
                                }
                                else{
                                    d = dirs.filter(lookup)[0];
                                    d.members.push(prop);
                                }
                                break;
                        }
                    }
                }
                return dirs;
            };

            /* valid params for format: flat, 2d, console, json */
            format = format || 'flat';
            dirs   = (format=='object') ? {} : [];

            if(dir===undefined || dir===null || dir==='' || dir==='*' || !dir){
                for(i=0; i<Atomix.namespaces.length; i++){
                    name = Atomix.namespaces[i];
                    ns   = nsget(name);
                    dirs = list(ns, name);
                }
            }
            else if(typeof dir=='string'){
                ns   = nsget(dir);
                dirs = list(ns, dir);
            }
            else if(typeof dir=='object'){
                ns   = dir;
                dirs = list(ns, dir);
            }

            if(format=='json')
                return JSON.stringify(dirs);
            if(format!='console')
                return dirs;
            return dirs.length;
            //return void 0;
        };

        /**
         * Make a package out of listed classes and export.
         * @param  {array} list    List of constructors in string representation.
         * @return {object}        New package with all the constructors.
         */
        this.pkg = function(list, name){
            var i,
                c,
                n,
                pack,
                Package,
                nsstring,
                self = this;

            if(typeof list=='string')
                nsstring = list;

            Package = function Package(){};
            Package.prototype.import = function(path){
                var constructor;
                constructor = self.in(path);
                constructor.make = function(...args){constructor.bind(constructor, ...args); return new constructor();};
                return constructor;
            };
            Package.prototype.export = function(path, cls){self.out(path, cls, false);};
            Package.prototype.in     = Package.prototype.import;
            Package.prototype.out    = Package.prototype.export;
            Package.prototype.ls     = function(format){return self.ls(nsstring, format);};
            Package.prototype.use    = function(path, ...args){
                var build, split;
                path = nsstring + "." + path;
                build = Atomix.autobuild(path, ...args);
                build.as = function(...args){
                    var ns,
                        name,
                        split;

                    for(i=0; i<args.length; i++){
                        if(typeof args[i]==='string')
                            name = args[i];
                        if(typeof args[i]==='object')
                            ns = args[i];
                    }

                    if(name!==undefined && name.indexOf(".")>-1){
                        split = Atomix.splitns(name);
                        ns    = split[0];
                        name  = split[1];
                        ns[name] = this;
                    }
                    else if(name!==undefined && ns===undefined){
                        return e('var ' + name + " = Atomix.autobuild('"+path+"');");
                    }
                    else if(ns!==undefined && name){
                        ns[name] = this;
                    }
                    else{
                        throw "Exception: Invalid parameters for function 'as'." +
                              "Provide a fully qualified namespace path or pass a name and a target object.";
                    }
                };
                return build;
            };

            pack = (name) ? Atomix.new.namespace(name) : new Package();

            if(list===undefined || list=='*')
                list = this.ls('*', 'flat');
            else if(typeof list=='string')
                list = this.ls(list, 'flat');

            for(i=0; i<list.length; i++){
                c = nsget(list[i]);
                n = list[i].split('.').pop() || c.name;
                pack[n] = nsget(list[i]);
            }

            return pack;
        };

        /**
         * Get a class and build into instance.
         * @param  {string} path    Namespaced import path.
         * @param  {mixed}  ns      Namespaced export path, or object.
         * @return {object}         Namespace exported to.
         */
        this.build = function(path, ns, ...args){
            var name,
                instance,
                namespaces;

            instance = Atomix.autobuild(path, ...args);

            if(typeof ns==='string'){
                namespaces = ns.split('.');
                name = (namespaces.length>1) ? namespaces.pop() : null;
                ns = nsref(global, namespaces);
            }

            name = (name===undefined || name===null) ? path.split('.').pop().toLowerCase() : name;
            ns[name] = instance;
            return ns;
        };
        this.c = this.build;
    };

    declare.singleton('PortsManager', Ports);
    port = Atomix.autobuild('PortsManager');

    /* Freeze global instance of Atomix Object. */
    Object.freeze(proton);
    Object.freeze(Proton);

    //Object.seal(Atomix);
    //Object.seal(Atomix._meta_);
    //Object.preventExtensions(Atomix);

    global.Interface = Interface;
    global.Atomix    = Atomix;
    global.Proton    = Proton;
    global.singleton = singleton;
    global.Singleton = Singleton;
    global.mx        = mx;
    global.declare   = declare;
    global.port      = port;
})(this);