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
        Quark,
        Proton,
        Singleton,
        Metadata,
        Interface,
        Constructor,
        Factory,
        ClassFactory,
        mx,
        quark,
        atomix,
        proton,
        declare,
        factory,
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
    f1 = "(function(call){return function <name>(){ return call(this, arguments);};})";
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
        while(ns!==global){
            var name = ns.name || "";

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
        var path = (context===global) ? "" : context.constructor.name;

        for(var i=0; i<namespaces.length; i++){
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
                    var name = Interface(namespaces[i]);
                    var ns = new name();
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
        var context = global;
        var namespaces = nsstring.split(".");

        for(var i=0; i<namespaces.length; i++){
            if(namespaces[i]!==""){
                if(typeof context[namespaces[i]] === 'undefined')
                    throw "Exception: Namespace '" + nsstring + "' does not exist.";
                context = context[namespaces[i]];
            }
        }
        return context;
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
        opts = opts || {};
        var getset = function(prop, i){
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

        for(let i in opts){
            if(opts.hasOwnProperty(i)){
                this[i] = opts[i];
                if(i=="name") this.class = opts[i];
            }
            if(host!==undefined && host._meta_!==undefined){
                if(i=="name")
                    getset("_class_", i);
                else if(i!="parent"){
                    var prop = "_"+i+"_";
                    getset(prop, i);
                }
            }
        }
    };

    /**
     * Base object definition and constructor.
     */
    Quark = function(){
        var _proto_ = Object.getPrototypeOf(this);

        /**
         * Factory for dynamic properties.
         * @param  {string}   prop      Property name
         * @param  {function} getter    function definition for the getter
         * @return {mixed}
         */
        var propfn = (function(prop, getter){
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
            var options, name, implementation, namespaces, ns, path, resolve, args;

            args = Array.from(arguments);

            resolve = function(name){
                if(_exports_[name]!==undefined)
                    return 'Atomix.exports.lib.' + name;
                else if(global[name]!==undefined)
                    return name;
                return name;
            };

            for(var i=0; i<args.length; i++){
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
                var ns, q;
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
            var proto, o;
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
            var proto, i, o, parents, rents, getlist;
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
            var meta, fn, proto, parent, child;
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
                var proto, p, code;
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
            var child, mixed, proto, instance;

            if(this instanceof Singleton.constructor){
                proto = Object.getPrototypeOf(this);

                if(typeof parent==='object'){
                    proto = proto.augment(parent, proto);
                }
                else if(typeof parent==='function'){
                    proto.constructor = proto.define(parent);
                    proto = proto.augment(parent, proto);
                }
                proto._meta_.mixin = parent;
                return proto;
            }

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
        this.define = function(mixin){
            var self   = this;
            var proto  = Object.getPrototypeOf(self);
            var parent = self.parent;

            if(this.instanceof(Singleton)){
                return atomix.prototype.singleton.call(self, self._meta_.name, mixin).constructor;
            }

            proto.constructor = function(...args){
                var func, fn;
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
        this.implements = this.define;
        this.employs = this.define;

        /**
         * Export the object to a namespace.
         * @param  {object} ns    The namespaced object to export to.
         * @return {string}       String representation of the namespaced object path.
         */
        this.export = function(ns){
            var namsespaces, scope, name, dest, nsstring;

            nsstring = (typeof ns=='object' && ns.constructor.name!="Library"  && ns!=global) ? ns.constructor.name : "";
            name = this._meta_.name;
            dest = (typeof ns==='string') ? ns : nsstring;
            dest = (typeof ns!=='undefined' && typeof ns.path!=='undefined') ? ns.path : dest;

            if(_nmsp_!==_exports_ && _nmsp_!==null){
                ns = _nmsp_;
                delete _exports_[name];
            }
            else if(this._meta_.ns!==_exports_ && this._meta_.ns){
                ns = this._meta_.ns;
                delete _exports_[name];
            }

            if(typeof ns==='string'){
                namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
                ns = nsref(global, namespaces);
                delete _exports_[name];
            }

            if(ns===undefined)
                ns = this._meta_.ns;
            else if(ns!==undefined)
                this._meta_.ns = ns;

            ns = (ns.hasOwnProperty('lib')) ? ns.lib : ns;
            ns[name] = this.constructor;

            dest = (ns===_exports_) ? 'Atomix.exports.lib'    : dest;
            dest = (ns===_util_)    ? 'Atomix.exports.util'   : dest;
            dest = (ns===_stat_)    ? 'Atomix.exports.stat'   : dest;
            dest = (ns.hasOwnProperty('lib')) ? dest + '.lib' : dest;
            dest = (dest==="" && ns!==global) ? ".." : dest;

            if(dest.substring(0, 2)!=='..' && _spaces_.indexOf(dest)<0 && dest!==""){
                _spaces_.push(dest);
                _spaces_.sort();
            }

            this._meta_.path = dest + '.' + name;

            if(ns.path===undefined)
                ns.path = (dest!='..') ? dest : "";

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
    Singleton = (function(){
        var instance, singleton, s, fn;
        singleton = Proton.prototype.decendant('Singleton');
        s = new singleton();
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

        Singleton.call(s);
        return new Singleton();
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
        var i, ns, opts, context, nsstring, namespaces, implementation;

        nsstring = name;

        for(i=0; i<args.length; i++){
            if(typeof args[i]==='object')
                opts = args[i];
        }
        for(i=0; i<args.length; i++){
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
        var p, child, Child;

        p = atomix.prototype.process(name, args);

        parent = (typeof p.opts.parent==='undefined') ? proton : p.opts.parent;
        Child  = parent.decendant(p.name, p.opts);
        child  = new Child();

        child.export(p.ns);

        if(typeof p.implementation!=='undefined')
            return child.define(p.implementation);

        return child;
    };

    /**
     * Method to create a singleton type object by inheriting from the Atomix Singleton Object.
     * @param  {string}   name              Name of the new singleton.
     * @param  {function} implementation    Object definition to apply to constructor.
     * @return {object}                     New object derived from the base singleton.
     */
    atomix.prototype.singleton = function(name, ...args){
        var p, s, fn, funx, instance;

        p = atomix.prototype.process(name, args);

        s = Singleton.decendant(p.name);
        s = new s();
        s._meta_        = new Metadata(p.opts, Object.getPrototypeOf(s));
        s._meta_.name   = p.name;
        s._meta_.info   = p.name + ' Object';
        s._meta_.parent = Singleton;
        s._meta_.type   = 'singleton';

        funx = (function(){
            var instance, imp, fn, implementation;
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
        var dest, namespaces;

        fn = (fn===undefined) ? this.exports.lib[name] : fn;
        dest = (ns===this.exports.lib && typeof ns!=='string') ? "Atomix.exports.lib" : "";

        if(typeof ns==='string'){
            dest = ns;
            namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
            ns = nsref(global, namespaces);
        }

        if(this.exports.lib!==ns && this.exports.static!==ns && this.exports.utils!==ns){
            if(!ns.hasOwnProperty('lib'))
                ns.lib = new lib();
            ns.lib[name] = fn;

            dest = (dest==="" && ns!==global) ? ".." : dest;
            dest += '.lib';
        }
        else if(this.exports.static===ns || this.exports.util===ns){
            ns[name] = fn;
        }

        if(dest.substring(0, 2)!=='..' && this.namespaces.indexOf(dest)<0 && dest!==""){
            this.namespaces.push(dest);
            this.namespaces.sort();
        }

        return dest + '.' + name;
    };

    /**
     * Method to import object from supplied import path and known namespaces.
     * @param  {string} name    Name of object or namespaced path.
     * @return {mixed}          Object or function requested.
     */
    atomix.prototype.import = function(name){
        if(name.indexOf('.') > -1){
            try{
                return nsget(name);
            }
            catch(e){
                var dotpath = name.split(".");
                name = dotpath.pop();
                name = dotpath.join('.') + ".lib." + name;
                return nsget(name);
            }
        }
        else if(this.exports.lib.hasOwnProperty(name))
            return this.exports.lib[name];
        else{
            var ns, nspath;
            for(var i=0; i<this.namespaces.length; i++){
                nspath = this.namespaces[i];
                ns = nsget(nspath);
                if(ns.hasOwnProperty(name))
                    return ns[name];
                if(ns.hasOwnProperty('lib') && ns.lib.hasOwnProperty(name))
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
        var constructor = (_nmsp_) ? _nmsp_[name] : this.exports.lib[name];
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
        var constructor = this.import(name);
        constructor = constructor.bind(this, ...args);
        return new constructor();
    };

    /**
     * Property-method to reset the Atomix class constructor.
     * @return {Atomix}
     */
    atomix.prototype.reset = function(prop){
        Object.defineProperty(this, prop, {
            get: function(){
                this.nmsp = null;
                _nmsp_    = null;
                return this;
            },
            set: function(){
                prop = atomix.prototype.reset();
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
        var namespaces, nsstring;
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
    atomix.prototype.namespace = function(name, lib){
        var fn,
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
                var args = Array.from(arguments);
                var classname = "";
                for(var i=0; i<args.length; i++){
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

            for(var i in ns[name]){
                if(ns[name].hasOwnProperty(i))
                    space[i] = ns[name][i];
            }
            ns[name] = space;

            if(_spaces_.indexOf(nspath)<0){
                _spaces_.push(nspath);
                _spaces_.sort();
            }

            atomix.prototype.nmsp = null;
            return ns[name];
        }
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

    /**
     * Parse a string, object, or a constructor into a class, string or constructor
     * @param  {mixed} _class_    Class representation: object, function or string.
     * @param  {string} _type_    Type to return... String, object or function.
     * @return {mixed}            The representation of the class.
     */
    atomix.prototype.parse = function(_class_, _type_){
        if(typeof _class_==="function"){
            if(_type_===undefined || _type_=='constructor' || _type_=='function')
                return _class_;
            else if(_type_=='instance' || _type_=='object')
                return new _class_();
        }
        else if(typeof _class_==="string"){
            var fn = this.import.call(this, _class_);
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
        var f, fn, i, a, n, nonstat, atmx, error;
        atmx  = atomix.prototype;
        error = "Exception: New instances of static classes may not be constructed.";

        if(_class_===undefined || _class_===null || _class_===''){
            nonstat = atomix.prototype.class(name, ...args);
            _class_ = nonstat.constructor;
        }

        if(true===(this instanceof global.constructor || this instanceof atmx.static)){
            throw error;
        }
        else if(true===this instanceof ClassFactory || this===atmx){
            try{
                if(false===this.instanceof(_class_)){
                    f = Atomix.parse(_class_);
                    f = f.bind.apply(f, [f].concat(args));
                    i = new f();
                    i = Object.create(i);
                    f = i.decendant(i.name, {type:'static'});
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

                    Atomix.export('Atomix.exports.static', name, f);
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
    Atomix.new            = Atomix.reset('new');
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
    Atomix.static.path    = "Atomix.exports.static";
    Atomix.util.path      = "Atomix.exports.util";
    Atomix.lib.parent     = Atomix.exports;
    Atomix.static.parent  = Atomix.exports;
    Atomix.util.parent    = Atomix.exports;
    mx                    = Atomix;
    atomix.prototype      = Atomix;

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
        var def, fabrik;

        def           = new util();
        def.class     = function(...args){ return Atomix.new.class(    ...args); };
        def.singleton = function(...args){ return Atomix.new.singleton(...args); };
        def.namespace = function(...args){ return Atomix.new.namespace(...args); };
        def.static    = function(...args){ return Atomix.new.static(   ...args); };
        def.ns        = function(...args){ return Atomix.new.ns(       ...args); };
        fabrik        = function(       ){ return factory.augment(def, factory); };

        return new ClassFactory(fabrik);
    })(ClassFactory.prototype);

    /* Freeze global instance of Atomix Object. */
    Object.freeze(proton);
    Object.freeze(Proton);
    //Object.seal(Atomix);
    //Object.seal(Atomix._meta_);
    //Object.preventExtensions(Atomix);

    global.Interface = Interface;
    global.Atomix    = Atomix;
    global.Proton    = Proton;
    global.Singleton = Singleton;
    global.mx        = mx;
    global.declare   = declare;
})(this);