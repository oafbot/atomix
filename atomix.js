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
        f3,
        f4,
        mix,
        exp,
        lib,
        util,
        nsref,
        nsget,
        fcopy,
        extend,
        isnew,
        errors,
        Atomix,
        Ports,
        Quark,
        Proton,
        Atomixer,
        Singleton,
        Metadata,
        Abstract,
        Interface,
        Constructor,
        AtomixError,
        Exceptions,
        ErrorClass,
        Factory,
        ClassFactory,
        PackageManager,
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
        _sys_,
        _lib_,
        _nmsp_,
        _util_,
        _stat_,
        _spaces_,
        _exports_,
        _errors_,
        EndOfFile,
        eof;

    exp  = function Exports(){};
    lib  = function Library(){};
    util = function Utility(){};
    e  = eval;

    EndOfFile = function EndOfFile(){this.instance=null;};
    EndOfFile.prototype = Object.create(null);
    eof = new EndOfFile();
    Object.freeze(eof);
    Object.freeze(EndOfFile.prototype);
    // global = new Proxy(global, {
    //     get : function(t, k, r) { if(k=='eof') return eof.instance; return t[k]; },
    // });
    Object.defineProperty(global, 'eof', {
        get : function(){return eof.instance;},
        set : function(v){throw Error("End of file object cannot be redefined.");}
    });


    isnew = function(o, c){
        if(c===undefined)
            return (false===(o instanceof global.constructor)) ? true : false;
        return (false===(o instanceof c)) ? false : true;
    };

    extend = function(s){
        var fn, p;
        eval('fn = function '+s.name+'(){return s.call(this)};');
        Object.defineProperty(this.prototype.constructor, 'name', {writable:true});

        this.prototype = new fn();
        this.prototype.constructor = fn;
        this.prototype.superclass = (function(){return s;})();
        this.superclass = this.prototype.superclass;
        return this;
    };

    fcopy = function(f1, f2){
        if(f2===undefined)
            f2 = function(){};
        var temp = function temporary() { return f2.apply(f1, arguments); };
        for(var k in f1) {
            if(f1.hasOwnProperty(k))
                temp[k] = f1[k];
        }
        return temp;
    };

    AtomixError = function AtomixError(n, message, name) {
        var last,
            gen,
            pops,
            proto,
            self,
            stax,
            stack,
            trace;

        self  = this;
        stack = new Error().stack;
        trace = stack.split("\n").map(function(e){return e.trim();});
        last  = stack.match(/[^\s]+$/);

        pops  = function*(){
            var n = 0;

            while(n<trace.length){
                var next, log;

                if(typeof next=='number')
                    n = next;

                log  = trace[n].match(/[^\s]+$/);
                next = yield log;
                n    = (next && next.done) ? 0 : n + 1;
            }
        };
        stax = pops();

        this.list = [
            "AbstarctInvocationError",
            "InterfaceReferenceError",
            "NamespaceReferenceError",
            "ExportError",
            "ImportError",
            "ParameterError",
            "StaticInvocationError"
        ];

        this.code    = n;
        this.name    = name || "AtomixError";
        this.type    = message.split(":").shift();
        this.message = message;
        this.stack   = stack;
        this.trace   = trace;

        this.trace.next = function(n){
            var next,
                value;

            next  = (n!==undefined) ? stax.next(n) : stax.next();
            value = (next.done) ? void 0 : next.value;

            if(value===undefined)
                stax = pops();
            if(n!==undefined)
                value = stax.next().value;

            return value;
        };

        this.trace.dump = function(){
            var orig,
                name,
                next,
                msg,
                traces;

            orig   = self.stack;
            next   = self.trace.next();
            traces = [];

            console.groupCollapsed("Error[" + self.code + "]: " + self.name);
                while(next!==undefined){
                    console.log(next);
                    if(next[0]==="Error"){
                        name = next.input.match(/[^(at)\s]+[a-zA-z0-9.<>]+[^\s\(]/);
                        msg  = next.pop();

                        self.stack = `${name} at ${msg}`;
                        console.warn(self.stack);
                        next = self.trace.next();
                    }
                }
            console.groupEnd();

            self.stack = orig;
            stax = pops();
            return [self.code, self.name, self.type];
        };

        this.trace.last = `${this.name} at ${last}`;

        this.pipe  = function(name){ return thismessage.replace(/<name>/g, name); };
        this.alter = function(typ){
            var f;
            proto = Object.getPrototypeOf(this);

            switch(typ){
                case 'TypeError':
                    ErrorClass = TypeError;
                    break;
                case 'ReferenceError':
                    ErrorClass = ReferenceError;
                    break;
                default:
                    ErrorClass = Error;
                    break;
            }

            proto             = Object.create(AtomixError.prototype);
            proto.name        = this.list[this.code];
            proto.message     = message;
            proto.constructor = Constructor.call(this, proto.name, AtomixError);
            proto.constructor.prototype = Object.create(ErrorClass.prototype);
            Object.setPrototypeOf(this, proto);
            return new this.constructor(n, message, proto.name);
        };

        if(isnew(this, AtomixError)){
            self = this.alter(this.type);
            //console.error(self.toString());
            _errors_.push(self);
        }
        return self;
    };

    AtomixError.prototype = Object.create(Error.prototype);
    AtomixError.prototype.name = "AtomixError";
    AtomixError.prototype.message = "";
    AtomixError.prototype.constructor = AtomixError;

    Exceptions = function Exceptions(){
        var i, f, msgs, list;

        f = function(n, s){ var e = new AtomixError(n, msgs[n]); if(s) return e.pipe(s); return e.message; };

        list = ["abstarct", "unknown constructor", "namespace", "export", "import", "parameter", "static"];

        msgs = {
            0 : "TypeError: Abstract classes cannot be instantiated.",
            1 : "ReferenceError: Unknown interface invoked",
            2 : "ReferenceError: Namespace '<name>' does not exist.",
            3 : "ReferenceError: Errors were encountered in export. Constructor '<name>' was not exported.",
            4 : "ReferenceError: Object or function '<name>' not found.",
            5 : "TypeError: Parameter error.",
            6 : "TypeError: New instances of static classes may not be constructed.",
            7 : "TypeError: Invalid parameter. Constructor missing from arguments.",
        };

        this.num   = function(n, str){return f(n, str);};
        this.raise = function(id, str){
            var e;
            if(typeof id==='number')
                e = this.num(id, str);
            else if(typeof id=='string' && this.hasOwnProperty(id))
                e = function(str){ return f(msgs.indexOf(id), str); };
            else
                throw f(5);
            throw e;
        };
        this.throw = this.raise;

        this.abstract  = function( ){ return f(0   ); };
        this.unknown   = function( ){ return f(1   ); };
        this.namespace = function(s){ return f(2, s); };
        this.export    = function(s){ return f(3, s); };
        this.import    = function(s){ return f(4, s); };
        this.parameter = function( ){ return f(5   ); };
        this.static    = function( ){ return f(6   ); };
        this.missing   = function( ){ return f(7   ); };
    };

    errors = new Exceptions();
    global.errors = errors;

    f  = function(name, s){if(s==f1||s==f2||s==f3||s==f4){s=s.replace(/<name>/g, name);return e(s);}
         throw errors.num(1);};

    f1 = "(function(){function <name>(){};<name>.extend="+extend.toString()+";return <name>;})";

    f2 = "(function(call){function <name>(){return call(this, arguments);};<name>.extend="+extend.toString()+
         ";return <name>;})";

    f3 = "(function(){function <name>(){if(false===(this instanceof "+global.constructor.name+
         "))throw '"+errors.abstract.toString()+"()';return void 0;};<name>.extend="+extend.toString()+
         ";<name>.type='abstract';Object.freeze(<name>);this.name=<name>;return <name>;})";

    f4 = "(function(fn){function <name>(){if(false===(this instanceof "+global.constructor.name+
         "))throw '"+errors.abstract.toString()+"()'; return void 0;};<name>.extend="+extend.toString()+
         ";<name>.extend(fn);<name>.type='abstract';Object.freeze(<name>);this.name=<name>;return <name>;})";


    _exports_ = new exp();
    _sys_     = new lib();
    _lib_     = new lib();
    _util_    = new lib();
    _stat_    = new lib();
    _nmsp_    = null;
    _spaces_  = [];
    _errors_  = [];

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

            if(!ns.path && ns.node && ns.node.path && name)
                ns.path = ns.node.path + "." + name;

            if(ns.node!==undefined)
                ns = ns.node;
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
            libs,
            name;

        path = (context===global) ? "" : context.constructor.name;
        libs = ["lib", "sys", "util", "stat"];

        for(i=0; i<namespaces.length; i++){
            if(namespaces[i]!==""){
                if(typeof context[namespaces[i]] === 'undefined'){
                    if(libs.indexOf(namespaces[i])>=0 && (context instanceof lib)===false){
                        context[namespaces[i]] = new lib();
                    }
                    else{
                        name = Interface(namespaces[i]);
                        ns   = new name();
                        context[namespaces[i]] = ns;
                    }
                }
                path += (context===global) ? namespaces[i] : "." + namespaces[i];
                context[namespaces[i]].path = path;
                context[namespaces[i]].node = context;
                context = context[namespaces[i]];
            }
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
                   throw errors.namespace.pipe(nsstring);
                context = context[namespaces[i]];
            }
        }
        if(context===global)
            throw error.namespace.pipe(nsstring);
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
            fn = fn.bind(target.prototype);
            targeted = target;
        }

        if(name && !targeted.hasOwnProperty(name))
            targeted[name] = fn;
        else if(fn.name && !targeted.hasOwnProperty(name))
            targeted[fn.name] = fn;
        else if(targeted.hasOwnProperty(name))
            return target;
        else
            throw "Exception: Invalid parameter. Name parameter missing and the function passed was anonymous. Property assignements must be named. Either explicitly pass a property name value or name the function.";

        return target;
    };

    /**
     * Create a constructor that cannot be instantiated.
     * @param {string} name
     */
    Abstract = function Abstarct(name, fn){
        if(fn) Object.defineProperty(fn, 'name', {value:'Abstract', writable:true});
        return (fn!==undefined) ? (f(name, f4))(fn) : f(name, f3)();
    };

    /**
     * Create a unimplemented constructor for a new named object prototype.
     * @param {string} name    The name of the constructor / new prototype object.
     */
    Interface = function Interface(name){return f(name, f1)();};

    /**
     * Create a constructor with applied context for a new named object prototype.
     * @param {string}   name
     * @param {Function} fn
     */
    Constructor = function Constructor(name, fn){return (f(name, f2))(fn.apply.bind(fn));};

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
    Quark = function Quark(){
        var _proto_ = Object.getPrototypeOf(this);

        /**
         * Factory for dynamic properties.
         * @param  {string}   prop      Property name
         * @param  {function} getter    function definition for the getter
         * @return {mixed}
         */
        this.getprop = (function(prop, getter){
            Object.defineProperty(Quark.prototype, prop, {
                get: getter,
                set: function(){prop = this.getprop.call(this);},
                configurable: true
            });
        }).bind(Quark.prototype);

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
                if(_lib_[name]!==undefined)
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
            ns     : _sys_,
            parent : Object.prototype,
            type   : 'class'
        }, this.proto);

        /**
         * Throw exception if abstract class is called.
         * @return {void}
         */
        this.init = function(){
            if(this instanceof this.constructor && this.constructor.type=='abstract')
                throw errors.abstract();
            this._meta_.type = 'abstract';
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
        this.parent = this.getprop("parent", function(){
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
        this.ancestors = this.getprop('ancestors', function(){
            var i,
                o,
                proto,
                rents,
                parent,
                parents,
                getlist;

            proto   = Object.getPrototypeOf(this);
            parents = [this];
            rents   = Object.getPrototypeOf(parents);

            getlist = (function(prop, getter){
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: function(){prop = this.getprop.call(this);},
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

            parent = (this._meta_.parent!==undefined) ? this._meta_.parent : null;
            //proto = parent;

            if(proto instanceof Quark){
                while(proto instanceof Quark){
                    if(typeof proto._meta_.mixin!=='undefined')
                        parents.push(proto._meta_.mixin);
                    if(typeof proto._meta_.parent!=='undefined')
                        parents.push(proto._meta_.parent);
                    if(typeof proto._meta_.abstract!=='undefined')
                        parents.push(proto._meta_.abstract);

                    proto  = proto._meta_.parent;
                    parent = (parent!==proto && proto._meta_.parent) ? proto._meta_.parent : null;
                }
                //parents.push(Object.prototype);
                return parents;
            }
            return void 0;
        });

        /**
         * Get the name of the class.
         * @return {string}
         */
        this.name = this.getprop('name', function(){
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
        this.proton = this.getprop('proton', function(){
            return Object.getPrototypeOf(this);
        });

        /**
         * Create a child object that inherits from this object.
         * @param  {string} name    Name of the child object
         * @param  {object} opts    Configuration options and metadata.
         * @return {function}       Constructor for the child object.
         */
        this.derive =
        this.decendant = function(name, opts){
            var fn,
                meta,
                child,
                self,
                proto,
                struct,
                parent;

            parent = this;

            opts      = (typeof opts!=='undefined') ? opts : {};
            opts.name = name;
            opts.info = (typeof opts.info==='undefined') ? name + " Object" : opts.info;
            opts.type = (typeof opts.type==='undefined') ? "class"          : opts.type;
            opts.ns   = (typeof opts.ns  ==='undefined') ? undefined        : opts.ns;

            fn = Interface(name);
            fn.prototype = Object.create(parent);
            fn.prototype.constructor = fn;

            self = fn.prototype;
            meta = new Metadata(opts, self);

            fn.prototype.super = function(code, args){
                var proto;

                proto = Object.getPrototypeOf(this);

                if(code && typeof code==='function'){
                    this.augment(code);
                    code.apply(this, args);
                }

                this._meta_.parent = parent;
                return this;
            };

            fn.prototype._meta_ = meta;
            fn.prototype._meta_.parent = parent;
            fn.prototype.export(meta.ns);

            return fn;
        };

        /**
         * Child object inherits properies from the parent object via mixin.
         * @param  {object} parent
         * @param  {object} child
         * @return {object} child
         */
        this.extend =
        this.approp =
        this.augment = function(parent, child){
            var i,
                proto;
            child = (child===undefined) ? this : child;
            proto = Object.getPrototypeOf(child);

            for(i in parent){
                if(!child.hasOwnProperty(i) && typeof child[i]=='undefined')
                    if(i!=='_meta_')
                        proto[i] = parent[i];
                if(i=='init' && !proto.hasOwnProperty(i))
                    proto[i] = parent[i];
            }

            if(typeof parent!=='function' && parent._meta_ && parent._meta_.abstract===undefined)
                child._meta_.mixin = parent;

            if(child instanceof atomix && !(proto instanceof atomix)){/*pass*/}else{
                child.export(child._meta_.ns);
            }
            return child;
        };

        /**
         * Define object's inheritance.
         * @param  {object} parent    Parent object that this will inherit from.
         * @return {object}           The redefined context for this object.
         */
        this.extends =
        this.inherits = function(parent){
            var c,
                f,
                p,
                f0,
                f1,
                fn,
                abs,
                impl,
                child,
                mixed,
                proto,
                abstract,
                instance;

            if(typeof parent=='function' && parent.type=='abstract'){
                f0  = function(){if(false===(this instanceof global.constructor))
                      throw errors.abstract();return void 0;};
                abs = function Abstract(){return f0();};

                abstract = parent;
                proto = new parent.prototype.constructor();
                //proto.superclass = abs;
                f1   = Constructor('Implementation', abstract.prototype.superclass);
                impl = new f1();
                proto.superclass = impl.constructor;
                fn = Constructor(parent.name, (function(){return proto;}));
                fn.prototype = proto;
                fn.prototype.constructor = fn;

                parent = new fn();
                parent = Object.create(parent);
                child  = this.augment(parent);

                child._meta_.parent   = parent;
                child._meta_.abstract = abstract.prototype;
                abstract.prototype.constructor = abs;
                return child;
            }

            else if(this instanceof Singleton){
                proto = Object.getPrototypeOf(this);

                if(typeof parent==='object'){
                    proto = proto.augment(parent, proto);
                }
                else if(typeof parent==='function'){
                    proto.constructor = proto.implements(parent);
                    proto = proto.augment(parent, proto);
                }
                proto._meta_.mixin = parent;
                proto._meta_.type  = "singleton";
                return this;
            }

            else if(parent instanceof Singleton ||
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
                //child.prototype.constructor.prototype = c;
                child.prototype.export(c.exports);
                child.prototype._meta_.parent = this;
                child.prototype._meta_.mixin  = parent.prototype;
                child.prototype._meta_.type   = "singleton";
                return new child();
            }
            else if(parent instanceof Quark){
                child = parent.decendant(this._meta_.name, this._meta_);
                child.prototype._meta_.parent = parent;
                return Object.create(child.prototype);
            }
            else if(parent.prototype instanceof Quark){
                parent = new parent();
                child  = parent.decendant(this._meta_.name, this._meta_);
                child.prototype._meta_.parent = parent;
                return Object.create(child.prototype);
            }
            return this.augment(parent, this);
        };

        /**
         * The implementation for a new object 'class'.
         * @param  {function} mixin    A function that adds functionality and defines the object.
         * @return {function}          The constructor to create the redefined object.
         */
        this.employs =
        this.implements = function(mixin){
            var self   = this,
                proto  = Object.getPrototypeOf(self),
                parent = self.parent;

            if(mixin.type && mixin.type=='abstract')
                return proto.inherits(mixin);

            if(this.instanceof(singleton))
                return atomix.prototype.singleton.call(self, self._meta_.name, self._meta_, mixin).constructor;

            proto.constructor = function(...args){
                var f,
                    m,
                    fn;

                f = function(...a){
                    self = self.super(mixin, a);
                    if(this.init!==undefined)
                        this.init.call(self, ...a);
                    return this;
                };

                fn = Constructor(self._meta_.name, f);
                fn.prototype = self;
                fn.prototype.constructor = fn;
                fn.prototype.constructor.prototype = fn.prototype;
                fn = fn.bind(self, ...args);

                proto = new fn();
                fn.prototype = proto;
                return proto;
            };

            proto.constructor = Constructor(proto._meta_.name, proto.constructor);
            self.constructor.prototype = proto;
            self.export(self._meta_.ns);

            return self.constructor;
        };

        /**
         * Export the object to a namespace.
         * @param  {object} ns    The namespaced object to export to.
         * @return {string}       String representation of the namespaced object path.
         */
        this.export = function(ns){
            var name,
                dest,
                proto,
                scope,
                nsstr,
                namespaces;

            proto = Object.getPrototypeOf(this);

            nsstr = (typeof ns=='object' && ns.constructor.name!="Library" && ns!=global) ? ns.constructor.name : "";
            name  = this._meta_.name;
            dest  = (typeof ns==='string') ? ns : nsstr;
            dest  = (typeof ns!=='undefined' && typeof ns.path!=='undefined') ? ns.path : dest;

            if(this.name != proto.name){
                if(this._meta_.ns===undefined){
                    if(typeof ns==='string'){
                        namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
                        ns = nsref(global, namespaces);
                        _nmsp_ = null;
                    }
                    else if(_nmsp_!==_lib_ && _nmsp_!==null){
                        ns = _nmsp_;
                    }

                    if(ns!==undefined)
                        this._meta_.ns = ns;
                    else{
                        this._meta_ns = _lib_;
                        ns = _lib_;
                    }
                }
                else if(this._meta_.ns && this._meta_.ns){
                    if(this.hasOwnProperty("_meta_"))
                        ns = this._meta_.ns;
                }
                else{
                    ns = _lib_;
                    this._meta_.ns = _lib_;
                }
            }

            ns = (ns.hasOwnProperty('lib')) ? ns.lib : ns;
            ns[name] = this.constructor;

            dest = (ns===_sys_)  ? 'Atomix.exports.sys'       : dest;
            dest = (ns===_lib_)  ? 'Atomix.exports.lib'       : dest;
            dest = (ns===_util_) ? 'Atomix.exports.util'      : dest;
            dest = (ns===_stat_) ? 'Atomix.exports.stat'      : dest;
            dest = (ns.hasOwnProperty('lib')) ? dest + '.lib' : dest;
            dest = (dest==="" && ns!==global) ? "*" : dest;

            if(dest.substring(0, 1)!=='*' && _spaces_.indexOf(dest)<0 && dest!==""){
                _spaces_.push(dest);
                _spaces_.sort();
            }

            if(!ns.path)
                this._meta_.path = dest + '.' + name;

            if(ns.path===undefined)
                ns.path = (dest!='*') ? dest : "";

            if(dest.indexOf('*')===0){
                console.warn("Namespace could not be converted to qualified ns path: " + dest, ns);
            }

            if(ns!=_nmsp_)
                _nmsp_ = null;

            if(ns!==_lib_){
                delete _lib_[name];
            }
            else if(ns!==_sys_){
                delete _sys_[name];
            }
            else if(ns!==_util_){
                delete _util_[name];
            }
            else if(ns!==_stat_){
                delete _stat_[name];
            }

            return dest + '.' + name;
        };

        /**
         * Append new methods to the prototype post factum.
         * @param  {string}   method            The method name.
         * @param  {function} implementation    The function body of the method.
         * @return {object}                     Quark descendant object.
         */
        this.method = function(method, implementation){
            if(!this.hasOwnProperty(method))
                this[method] = implementation;
            return this;
        };

        this.init();
    };

    Quark.extend = extend;
    quark = new Quark('Quark', {info:'Quark Object'});
    //Quark.prototype = quark;

    /**
     * Proton. Base Object for Atomix inheritance.
     * @type {Proton}
     */
    Proton = quark.decendant('Proton', {info:'Proton Object', ns:_sys_, type:'base'});
    proton = new Proton();
    //Proton.prototype = proton;

    /**
     * Creates a base singleton object all singletons may inherit from.
     * @return {Singleton}    Base Singleton Object.
     */
    singleton = (function(){
        var s,
            fn,
            instance,
            singleton;

        s = Proton.prototype.decendant('Singleton', {info:'Singleton Object', ns:_sys_, type:'singleton'});
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
            //fn.prototype.constructor.prototype = instance;
            instance = new fn();
        };

        Singleton = Constructor('Singleton', Singleton);
        Singleton.call(s);
        singleton = new Singleton();
        Singleton.prototype = singleton;
        Singleton.prototype.constructor = Singleton;
        //Singleton.prototype.constructor.prototype = singleton;
        return singleton;
    })();

    /**
     * Atomix constructor.
     * @type {Proton}
     */
    atomix = proton.decendant('Atomix', {info:'Atomix Object', ns:_sys_, type:'utility'});
    atomix.prototype = new atomix();
    atomix.prototype.implements(function(s){
        this.init = function(s){
            this.scope = (s===undefined) ? global : s;
            this._meta_.type = 'utility';
        };
        //this.init(s);
    });

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
            context = (_nmsp_===null) ? global : _nmsp_;
            context = (namespaces.length>0 || _nmsp_!==null) ? context : _lib_;
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
    atomix.prototype.class = function(name, ...args){
        var p,
            child,
            Child;

        p = atomix.prototype.process(name, args);

        parent = (typeof p.opts.parent==='undefined') ? proton : p.opts.parent;
        Child  = parent.decendant(p.name, p.opts);
        child  = new Child();

        child.export(p.ns);

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

        s = singleton.decendant(p.name, p.opts);
        s = new s();
        s._meta_        = new Metadata(p.opts, Object.getPrototypeOf(s));
        s._meta_.name   = p.name;
        s._meta_.info   = p.name + ' Object';
        s._meta_.parent = singleton;
        s._meta_.type   = 'singleton';
        s._meta_.ns     = p.ns;

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
            }.bind(s);
        });

        fn = Interface(p.name);
        fn.prototype = s;
        fn.prototype.constructor = Constructor(p.name, funx());
        //fn.prototype.constructor.prototype = s;
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
    atomix.prototype.out =
    atomix.prototype.export = function(ns, name, fn){
        var dest,
            namespaces;

        if(name===undefined && fn===undefined){
            return void 0;
        }

        fn   = (fn===undefined) ? _lib_[name] : fn;
        dest = (ns===_lib_ && typeof ns!=='string') ? "Atomix.exports.lib" : "";

        if(typeof ns==='string'){
            dest = ns;

            switch(dest){
                case 'Atomix.exports.stat':
                    ns = _stat_;
                    break;
                case 'Atomix.exports.util':
                    ns = _util_;
                    break;
                case 'Atomix.exports.sys':
                    ns = _sys_;
                    break;
                default:
                    namespaces = (ns.indexOf('.') > -1) ? ns.split(".") : [ns];
                    ns = nsref(global, namespaces);
                    break;
            }
        }

        if(ns instanceof lib || ns.constructor.name=="lib"){
            ns[name] = fn;
        }
        else if(_exports_!==ns && _lib_!==ns && _stat_!==ns && _util_!==ns && _sys_!==ns){
            if(!ns.hasOwnProperty('lib'))
                ns.lib = new lib();

            ns.lib[name] = fn;

            dest = (dest==="" && ns!==global) ? "*" : dest;
            dest += '.lib';
        }
        else if(_stat_===ns || _util_===ns || _lib_===ns || _sys_===ns){
            ns[name] = fn;
        }
        else if(_exports_===ns){
            ns.lib[name] = fn;
        }
        else{
            throw errors.export(name);
        }

        if(dest.substring(0, 1)!=='*' && _spaces_.indexOf(dest)<0 && dest!==""){
            _spaces_.push(dest);
            _spaces_.sort();
        }
        return dest + '.' + name;
    };

    /**
     * Method to import object from supplied import path and known namespaces.
     * @param  {string} name    Name of object or namespaced path.
     * @return {mixed}          Object or function requested.
     */
    atomix.prototype.in =
    atomix.prototype.import = function(name, strict){
        var i,
            c,
            f,
            ns,
            top1,
            top2,
            top3,
            self,
            scope,
            exempt,
            nspath,
            dotpath;

        self = this;

        f = function(path){return function(name){
                var ns,
                    dir,
                    spaces,
                    target;

                dir = name.indexOf(".");

                if(dir>-1 && dir!==0){
                    ns = atomix.prototype.splitns(name);
                    target = (ns[0].hasOwnProperty('lib')) ? ns[0].lib : ns[0];
                    target[ns[1]] = nsget(path);
                    return Atomix;
                }
                else if(dir===0){
                    spaces   = name.split(".");
                    name     = spaces.pop();
                    ns       = nsref(self.scope, spaces);
                    ns[name] = nsget(path);
                    if(this instanceof atomix)
                        return this;
                    return Atomix;
                }

                return e('var ' + name + " = " + path + ";(function(a){return a;}).call(this, Atomix);");
            };
        };

        if(strict){
            c = nsget(name);
            f = f(name);
            c = append(c, 'as', f);
            c = append(c, 'import', atomix.prototype.import);
            c = append(c, 'in',     atomix.prototype.import);
            return c;
        }

        /* If the requested import is a global level namespace */
        try{
            if(name.indexOf('.') < 0 && typeof nsget(name)=='object'){
                c = nsget(name);
                f = f(name);
                c = append(c, 'as', f);
                c = append(c, 'import', atomix.prototype.import);
                c = append(c, 'in',     atomix.prototype.import);
                return c;
            }
        }
        catch(e){ /* pass */ }

        /* Else if the requested import is a constructor */
        if(name.indexOf('.') > -1){
            try{
                c = nsget(name);
                f = f(name);
                c = append(c, 'as', f);
                c = append(c, 'import', atomix.prototype.import);
                c = append(c, 'in',     atomix.prototype.import);
                return c;
            }
            catch(e){
                dotpath = name.split(".");
                name    = dotpath.pop();
                exempt  = [
                    "Atomix.exports.util",
                    "Atomix.exports.stat",
                    "Atomix.exports.sys",
                    "Atomix.exports.lib",
                    "Atomix.util",
                    "Atomix.stat",
                    "Atomix.sys",
                    "Atomix.lib"
                ];
                top1 = dotpath[0];
                top2 = dotpath[0]+"."+dotpath[1];
                top3 = dotpath[0]+"."+dotpath[1]+"."+dotpath[2];

                if(top1=="Atomix" && (exempt.indexOf(top2)>=0 || exempt.indexOf(top3)>=0))
                    name = dotpath.join('.') + "." + name;
                else
                    name = dotpath.join('.') + ".lib." + name;

                c = nsget(name);
                f = f(name);
                c = append(c, 'as', f);
                c = append(c, 'import', atomix.prototype.import);
                c = append(c, 'in',     atomix.prototype.import);
                return c;
            }
        }
        else if(_lib_.hasOwnProperty(name)){
            c = _lib_[name];
            f = f('Atomix.exports.lib.'+name);
            c = append(c, 'as', f);
            c = append(c, 'import', atomix.prototype.import);
            c = append(c, 'in',     atomix.prototype.import);
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
                    c = append(c, 'in',     atomix.prototype.import);
                    return c;
                }
                if(ns.hasOwnProperty('lib') && ns.lib.hasOwnProperty(name)){
                    c = ns.lib[name];
                    f = f(nspath+".lib."+name);
                    c = append(c, 'as', f);
                    c = append(c, 'import', atomix.prototype.import);
                    c = append(c, 'in',     atomix.prototype.import);
                    return c;
                }
            }
            throw errors.import.pipe(name);
        }
    };

    /**
     * Import namespace.
     * @param  {string} path    The fully qualified path to namespace.
     * @return {object}         Return namespace with additional functionality.
     */
    atomix.prototype.from = function(path){
        var i,
            ns,
            f1,
            f2;

        f1 = function(name){
            var sub,
                dir,
                tried,
                nspath,
                _nspath;

            sub    = ["lib", "sys", "util", "stat"];
            nspath = path+"."+name;
            tried  = [nspath];
            dir    = path.split(".").pop();

            try{
                return atomix.prototype.import(nspath, true);
            }
            catch(e){
                //console.warn("Namespace '" + nspath + "' not found.");
                if(sub.indexOf(dir)<0){
                    for(i=0; i<sub.length; i++){
                        _nspath = Atomix.subdir(nspath, sub[i]);
                        try{
                             tried.push(_nspath);
                             return Atomix.new.import(_nspath, true);
                        }catch(e){
                            if(i==sub.length-1){
                                throw "Exception: Namespace '" + nspath + "' does not exit. \nTried:\n" +
                                tried.join(",\n");
                            }
                        }
                    }
                }
                throw "Exception: Namespace '" + nspath + "' does not exit.";
            }
        };

        f2 = function(ns, prop){
            Object.defineProperty(Object.getPrototypeOf(ns), prop, {
                get: function(){return f1;},
                set: prop = f2.bind(ns, prop),
                configurable: true
            });
        };

        ns = nsget(path);
        f2(ns, 'import');
        f2(ns, 'in');
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
        constructor = (_nmsp_) ? _nmsp_[name] : _lib_[name];
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
                _nmsp_     = null;
                this.nmsp  = null;
                //this.scope = Object.getPrototypeOf(this).scope;
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

        if(ns===null || typeof ns==='undefined' || ns===_lib_){
            _nmsp_ = null;
            return this;
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
            ns.lib.node = ns;
            revpath(ns.lib);
        }

        _nmsp_ = ns;

        return this;
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
            except,
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
            except     = ["lib", "sys", "util", "stat"];

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

                if(ns[name]!==_lib_)
                    delete _lib_[classname];

                return instance;
            };

            fn = (except.indexOf(name)<0) ? Interface(name) : Constructor(name, lib);
            fn.prototype.class     = funx.bind(atomix.prototype.class);
            fn.prototype.singleton = funx.bind(atomix.prototype.singleton);
            fn.prototype.namespace = funx.bind(atomix.prototype.namespace);
            fn.prototype.static    = funx.bind(atomix.prototype.static);
            fn.prototype.path      = nspath;
            fn.prototype.type      = 'namespace';

            space = new fn();
            space.path = nspath;
            space.node = ns;

            for(i in ns[name]){
                if(ns[name].hasOwnProperty(i))
                    space[i] = ns[name][i];
            }
            ns[name] = space;

            if(_spaces_.indexOf(nspath)<0){
                _spaces_.push(nspath);
                _spaces_.sort();
            }

            return ns[name];
        }
    };

    /**
     * Method to convert string representation of a namespaced path to an object.
     * @param  {string} name    String representation of namespace.
     * @return {object}         Namespaced object.
     */
    atomix.prototype.parse =
    atomix.prototype.unpack = function(name){
        var ns,
            namespaces;

        namespaces = name.split(".");
        name = namespaces.pop();
        ns = nsget(namespaces.join('.'));
        return ns[name];
    };

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
        ns   = namespaces.length>0 ? nsget(namespaces.join('.')) : global;
        return [ns, name];
    };

    atomix.prototype.subdir = function(path, dir){
        var ns,
            name,
            namespaces;

        namespaces = path.split(".");
        name = namespaces.pop();
        ns   = namespaces.join('.');
        ns   = ns + "." + dir + "." + name;
        return ns;
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
        error = errors.static;

        if(_class_===undefined || _class_===null || _class_===''){
            if(_nmsp_===null)
                atomix.prototype.ns('Atomix.exports.stat');
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
                    // i = Object.create(i);
                    // f = i.decendant(i.name);
                    // f = f.bind(f, ...args);
                    // i = new f();

                    name = name || i.constructor.name;

                    fn = Constructor(name, i.constructor);
                    fn.prototype = i;
                    fn.prototype.constructor = fn;
                    //fn.prototype.constructor.prototype = fn.prototype;
                    fn.bind(fn, ...args);

                    n = new fn();
                    n.constructor = Constructor(name, function(){throw error;});
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

                    atomix.prototype.export("Atomix.exports.stat", name, f);
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

    atomix.prototype.nmsp              = _nmsp_;
    atomix.prototype.errors            = _errors_;
    atomix.prototype.exports           = _exports_;
    atomix.prototype.namespaces        = _spaces_;
    atomix.prototype.exports.sys       = _sys_;
    atomix.prototype.exports.lib       = _lib_;
    atomix.prototype.exports.stat      = _stat_;
    atomix.prototype.exports.util      = _util_;
    atomix.prototype.exports.path      = "Atomix.exports";
    atomix.prototype.exports.sys.path  = "Atomix.exports.sys";
    atomix.prototype.exports.lib.path  = "Atomix.exports.lib";
    atomix.prototype.exports.stat.path = "Atomix.exports.stat";
    atomix.prototype.exports.util.path = "Atomix.exports.util";
    atomix.prototype.exports.sys.node  = atomix.prototype.exports;
    atomix.prototype.exports.lib.node  = atomix.prototype.exports;
    atomix.prototype.exports.stat.node = atomix.prototype.exports;
    atomix.prototype.exports.util.node = atomix.prototype.exports;
    atomix.prototype.sys               = atomix.prototype.exports.sys;
    atomix.prototype.lib               = atomix.prototype.exports.lib;
    atomix.prototype.util              = atomix.prototype.exports.util;
    atomix.prototype.stat              = atomix.prototype.exports.stat;
    //atomix.prototype.new               = atomix.prototype.reset.call(Atomix);
    atomix.prototype.factory           = new lib();
    atomix.prototype.factory.interface = Interface;
    atomix.prototype.factory.construct = Constructor;
    atomix.prototype.factory.abstract  = Abstract;
    //atomix.prototype.new               = atomix.prototype.reset.call(atomix.prototype);

    /* Global instance of Atomix */
    Atomix = new atomix();

    Atomix.nmsp       = _nmsp_;
    Atomix.namespaces = _spaces_;
    Atomix.sys        = Atomix.exports.sys;
    Atomix.lib        = Atomix.exports.lib;
    Atomix.util       = Atomix.exports.util;
    Atomix.stat       = Atomix.exports.stat;
    Atomix.new        = Atomix.reset.call(Atomix);

    //delete Object.getPrototypeOf(Atomix).constructor;
    atomix = Atomix.constructor;
    atomix.prototype = Atomix;
    mx = Atomix;
    //atomix.prototype.constructor = atomix;
    // atomix.prototype.constructor.prototype = Atomix;
    // atomix.prototype.constructor.prototype.constructor = atomix;
    // atomix.prototype.constructor.prototype.constructor.prototype = Atomix;
    //Object.setPrototypeOf(Atomix, atomix.prototype.constructor.prototype.constructor.prototype);

    Factory =
    Atomix.class('Factory', {type:'utility', ns:_util_})
        .implements(function(){
            this.init = function(factory){
                if(typeof factory=='function')
                    return factory();
            };
            return this.init();
        }
    );

    ClassFactory =
    Atomix.class('ClassFactory', {type:'utility', ns:_util_})
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

        /**
         * Prepare namespace as a package and supply followup functions for chaining import statements.
         * @param  {[type]} path [description]
         * @return {[type]}      [description]
         */
        this.from = function(path){
            var pkg = this.package(path);
            return pkg;
        };

        /**
         * Import a class constructor from a namespaced library.
         * @param  {string} path
         * @return {function}
         */
        this.in =
        this.import = function(path){
            var i, nspath, sub, tried;
            sub   = ["lib", "sys", "util", "stat"];
            tried = [path];
            try{
                return Atomix.new.import(path, true);
            }
            catch(e){
                for(i=0; i<sub.length; i++){
                    nspath = Atomix.subdir(path, sub[i]);
                    try{
                         tried.push(nspath);
                         return Atomix.new.import(nspath, true);
                    }catch(e){
                        if(i==sub.length-1){
                            throw "Exception: Namespace '" + path + "' does not exit. \nTried:\n" +
                            tried.join(",\n");
                        }
                    }
                }
            }
        };

        /**
         * Export the class constructor to a namespaced library.
         * @param  {...mixed} args     String: export path, function: constructor, boolean: delete other referances.
         * @return {string}            Namespace path to object.
         */
        this.out =
        this.export = function(...args){
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
                throw error.missing();
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
            this.out(dest, fn, true);
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
                cls,
                lib,
                name,
                prop,
                libs,
                dirs,
                list,
                index,
                lookup,
                twodee;

            lib = Atomix.lib.constructor;

            list = function(ns, name){
                if(ns.hasOwnProperty('lib') && !(ns instanceof lib)){
                    ns = ns.lib;
                    name += ".lib";
                }

                if(format=='console' || format=='stdio'){
                    console.group(name);
                    libs += 1;
                }

                lookup = function(e){return e.namespace==name;};
                twodee = function(e, i){return e[0]==name;};

                for(prop in ns){
                    if(ns.hasOwnProperty(prop) && prop!='node' && prop!='path'){
                        switch(format){
                            case 'flat':
                                dirs.push(name+"."+prop);
                                break;
                            case '2d':
                                if(dirs.some(twodee)){
                                    index = dirs.findIndex(twodee);
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
                                cls = nsget(name + "." + prop);
                                console.log("--- "     + prop);
                                dirs.push(  name + "." + prop);
                                //console.groupCollapsed("--- " + prop);
                                //console.log(cls.prototype._type_);
                                //console.groupEnd();
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
                if(format=='console' || format=='stdio')
                    console.groupEnd();
                return dirs;
            };

            /* valid params for format: flat, 2d, console, json */
            format = format || 'flat';
            dirs   = (format=='object') ? {} : [];
            libs   = 0;

            if(dir===undefined || dir===null || dir==='' || dir==='*' || !dir){
                for(i=0; i<_spaces_.length; i++){
                    name = _spaces_[i];
                    ns   = nsget(name);
                    dirs = list(ns, name);
                }
            }
            else if(dir==='Atomix' || dir==='Atomix.*'){
                let _dir_ = nsget('Atomix.exports');
                for(i in _dir_){
                    try{
                        name = "Atomix." + i;
                        ns   = nsget(name);
                        dirs = list(ns, name);
                    }catch(e){}
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
            if(format!='console' && format!='stdio')
                return dirs;

            console.groupCollapsed(dirs.length + " import " + (dirs.length>1 ? "paths" : "path") + " from " +
                                   libs + " " + (libs>1 ? "libraries" : "library"));
            for(i=0; i<dirs.length; i++)
                console.log(dirs[i]);
            console.groupEnd();
            //console.dir(dirs);
            return dirs.length;
        };

        /**
         * Make a package out of listed classes and export.
         * @param  {array} list    List of constructors in string representation.
         * @return {object}        New package with all the constructors.
         */
        this.package = function(list, name, exclude){
            var i,
                c,
                n,
                self,
                pack,
                Package,
                nsstring;

            self = this;

            exclude===undefined ?
            exclude = [
               'Atomix.exports.sys.Proton',
               'Atomix.exports.sys.Singleton',
               'Atomix.exports.sys.Atomix',
               'Atomix.exports.util.Factory',
               'Atomix.exports.util.ClassFactory',
               'Atomix.exports.util.PortsManager',
            ] :
            exclude=== null  ||
            exclude===''     ||
            exclude==='none' ||
            exclude===0      ||
            exclude===false  ?
            exclude = []     :
            exclude;

            if(typeof list=='string')
                nsstring = list;

            Package = function Package(){};
            Package.prototype.import = function(path){
                var constructor;
                path = (nsstring) ? nsstring + "." + path : path;
                constructor = self.in(path);
                constructor.make = function(...args){
                    constructor.bind(constructor, ...args);
                    return new constructor();
                };
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
                if(exclude.indexOf(list[i])<0){
                    c = nsget(list[i]);
                    n = list[i].split('.').pop() || c.name;
                    pack[n] = nsget(list[i]);
                }
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

    declare.singleton('PackageManager', {ns:_util_}, Ports);
    PackageManager = Atomix.util.PackageManager;
    PackageManager.bind(Atomix);
    port = new PackageManager();

    global.Quark     = Quark;
    global.Proton    = Proton;
    global.singleton = singleton;
    global.Singleton = Singleton;
    global.declare   = declare;
    global.ports     = port;
    global.pkg       = port;
    global.quark     = quark;
    global.mx        = mx;

    global.Atomix = (function(){
        var i, self;
        self = this;

        Atomixer = atomix.bind(self);
        Object.defineProperty(Atomixer, 'name', {value:self.name, writable:true});

        for(i in self)
            Atomixer[i] = self[i];

        for(i in self._meta_)
            Atomixer["_" + i + "_"] = self.meta(i);

        Atomixer.new       = self.new;
        Atomixer.ancestors = self.ancestors;
        Atomixer.name      = self.name;
        Atomixer.parent    = self.parent;
        Atomixer.proton    = self.proton;

        Atomixer.namespaces = _spaces_;
        Atomixer.sys        = _sys_;
        Atomixer.lib        = _lib_;
        Atomixer.util       = _util_;
        Atomixer.stat       = _stat_;

        return Atomixer;
    }).call(Atomix);
    console.log(global.Atomix)
    Object.defineProperty(global, 'Atomix', {configurable: false});

    /* Freeze global instance of Atomix Object. */
    // Object.freeze(proton);
    // Object.freeze(Proton);
    // Object.seal(global.Atomix);
    // Object.seal(global.Atomix._meta_);
    // Object.preventExtensions(global.Atomix);
})(this);
//const EOF = eof;