/**
 * Black8 Game Studio By Sunny
 * @author 刘黎明（Sunny）
 * @version 创建时间：2017-04-10 15:00:00
 * SClass
 */
app.__extends = function (d, b) {
    for (let p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
}
app.__define = app.__define || function (o, p, g, s) {
    Object.defineProperty(o, p, { configurable: true, enumerable: true, get: g, set: s });
};

app.registerProperty = function (classDefinition, property, type, asDefault) {
    let prototype = classDefinition.prototype;
    prototype.__meta__ = prototype.__meta__ || {};
    prototype.__meta__[property] = type;
    if (asDefault) {
        prototype.__defaultProperty__ = property;
    }
};

app.defineGetterSetter = function (proto, prop, getter, setter, getterName, setterName) {
    if (proto.__defineGetter__) {
        getter && proto.__defineGetter__(prop, getter);
        setter && proto.__defineSetter__(prop, setter);
    } else if (Object.defineProperty) {
        let desc = { enumerable: false, configurable: true };
        getter && (desc.get = getter);
        setter && (desc.set = setter);
        Object.defineProperty(proto, prop, desc);
    } else {
        throw new Error("browser does not support getters");
    }

    if (!getterName && !setterName) {
        let hasGetter = (getter !== undefined), hasSetter = (setter !== undefined), props = Object.getOwnPropertyNames(proto);
        for (let i = 0, len = props.length; i < len; i++) {
            let name = props[i];

            if ((proto.__lookupGetter__ ? proto.__lookupGetter__(name)
                : Object.getOwnPropertyDescriptor(proto, name))
                || typeof proto[name] !== app.TypeFunction)
                continue;

            let func = proto[name];
            if (hasGetter && func === getter) {
                getterName = name;
                if (!hasSetter || setterName) break;
            }
            if (hasSetter && func === setter) {
                setterName = name;
                if (!hasGetter || getterName) break;
            }
        }
    }

    let ctor = proto.constructor;
    if (getterName) {
        if (!ctor.__getters__) {
            ctor.__getters__ = {};
        }
        ctor.__getters__[getterName] = prop;
    }
    if (setterName) {
        if (!ctor.__setters__) {
            ctor.__setters__ = {};
        }
        ctor.__setters__[setterName] = prop;
    }
};

/**
 * clone
 * @function
 * @param {object|Array} obj The source object
 * @return {Array|object} The created object
 */
app.clone = function (obj) {
    let newObj = (obj.constructor) ? new obj.constructor() : {};
    for (let key in obj) {
        let copy = obj[key];
        if (copy && (typeof copy === app.TypeObject)) {
            newObj[key] = app.clone(copy);
        }
        else {
            newObj[key] = copy;
        }
    }
    return newObj;
};

app.inject = function (srcPrototype, destPrototype) {
    for (let key in srcPrototype) {
        destPrototype[key] = srcPrototype[key];
    }
};

app.newObject = function (ctor, arg0, arg1, arg2, arg3, arg4) {
    let obj = new ctor(arg0, arg1, arg2, arg3, arg4);
    if (arguments.length > 6) {
        app.error(4051);
    }
    // switch (arguments.length) {
    //     case 1: obj = new ctor(); break;
    //     case 2: obj = new ctor(arg0); break;
    //     case 3: obj = new ctor(arg0, arg1); break;
    //     case 4: obj = new ctor(arg0, arg1, arg2); break;
    //     case 5: obj = new ctor(arg0, arg1, arg2, arg3); break;
    //     case 6: obj = new ctor(arg0, arg1, arg2, arg3, arg4); break;
    //     default: throw Error("app.newObject参数不能大于5个！");
    // }
    return obj;
};

let objectList;
app.roughSizeOfObject = function (object, onComplete, onProcess) {
    if (objectList) {
        return;
    }
    objectList = [];
    let stack = [object];
    let bytes = 0;
    let maxBatch = Number.MAX_VALUE;
    if (onComplete) {
        maxBatch = 10000;
    }
    //
    function next() {
        if (onProcess) {
            onProcess(bytes);
        }
        let count = 0;
        while (stack.length && count < maxBatch) {
            count++;
            let value = stack.pop();

            if (typeof value === app.TypeBoolean) {
                bytes += 4;
            }
            else if (typeof value === app.TypeString) {
                bytes += value.length * 2;
            }
            else if (typeof value === app.TypeNumber) {
                bytes += 8;
            }
            else if (typeof value === app.TypeObject && objectList.indexOf(value) === -1) {
                objectList[objectList.length] = value;
                //
                for (let i in value) {
                    stack[stack.length] = value[i];
                }
            }
        }
        //
        if (onComplete) {
            if (stack.length) {
                setTimeout(next, 10);
            }
            else {
                objectList.length = 0;
                objectList = null;
                onComplete(bytes);
            }
        }
    }
    //
    if (onComplete) {
        setTimeout(next, 10);
    }
    else {
        next();
        objectList.length = 0;
        objectList = null;
    }
    return bytes;
};

/**
 * @namespace
 * @name ClassManager
 */
let ClassMgr = app.ClassMgr = {
    trackAlloc: false
};
//
(function () {
    let superProp = "_$_super";
    superProp = app.getNormP(superProp);
    let fnTest = new RegExp("\\b" + superProp.replace("$", "\\$") + "\\b");//fnTest = /\b_super\b/;
    let ctorProp = "_$ctor";
    ctorProp = app.getNormP(ctorProp);
    let constructorProp = "constructor";
    let desc = { writable: true, enumerable: true, configurable: true };
    let internalDesc = { writable: false, enumerable: false, configurable: false };
    //
    let _applyProps = function (_superCls, cls, props, superProp, desc, internalDesc, fnTest) {
        let _super = _superCls.prototype;
        let prototype = cls.prototype;
        let map = {};
        let benchmark = false;//app.macro.BENCHMARK;
        let _tmpRtn;
        for (let name in props) {
            let propName = app.getNormDP(name);
            if (propName !== name) {
                map[propName] = name;
            }
            let obj = props[name];
            let override = false;
            let hasSuperCall = null;
            if (typeof obj === app.TypeFunction) {
                override = (typeof _super[propName] === app.TypeFunction);
                hasSuperCall = true;//fnTest.test(obj);
                if (override && hasSuperCall) {
                    if (benchmark) {
                        desc.value = (function (name, fn) {
                            let func = function () {
                                let t = this;
                                let tmpSuper = t[superProp];
                                t[superProp] = _super[name];
                                let currTime = app.getTimer();
                                _tmpRtn = fn.apply(t, arguments);
                                let cost = app.getTimer() - currTime;
                                func.__cost = cost;
                                if (func.__maxCost === undefined || cost > func.__maxCost) {
                                    func.__maxCost = cost;
                                }
                                if (func.__callCount === undefined) {
                                    func.__callCount = 0;
                                }
                                func.__callCount++;
                                t[superProp] = tmpSuper;
                                return _tmpRtn;
                            };
                            app.applyType(func);
                            if (cls._hashable) {
                                app.SHC(func);
                            }
                            return func;
                        })(name, obj);
                    }
                    else {
                        desc.value = (function (name, fn) {
                            let func = function () {
                                let t = this;
                                let tmpSuper = t[superProp];
                                t[superProp] = _super[name];
                                _tmpRtn = fn.apply(t, arguments);
                                t[superProp] = tmpSuper;
                                return _tmpRtn;
                            };
                            app.applyType(func);
                            if (cls._hashable) {
                                app.SHC(func);
                            }
                            return func;
                        })(name, obj);
                    }
                }
                else {
                    if (benchmark) {
                        desc.value = (function (name, fn) {
                            let func = function () {
                                let currTime = app.getTimer();
                                _tmpRtn = fn.apply(this, arguments);
                                let cost = app.getTimer() - currTime;
                                func.__cost = cost;
                                if (func.__maxCost === undefined || cost > func.__maxCost) {
                                    func.__maxCost = cost;
                                }
                                if (func.__callCount === undefined) {
                                    func.__callCount = 0;
                                }
                                func.__callCount++;
                                return _tmpRtn;
                            };
                            app.applyType(func);
                            if (cls._hashable) {
                                app.SHC(func);
                            }
                            return func;
                        })(name, obj);
                    }
                    else {
                        app.applyType(obj);
                        if (cls._hashable) {
                            app.SHC(obj);
                        }
                        desc.value = obj;
                    }
                }
                app.funcCount++;
                Object.defineProperty(prototype, propName, desc);
            }
            else if (obj !== null && obj !== undefined && typeof obj === app.TypeObject) {
                let getter = obj.get;
                let setter = obj.set;
                if (typeof getter !== app.TypeFunction) {
                    getter = null;
                }
                if (typeof setter !== app.TypeFunction) {
                    setter = null;
                }
                if (getter) {
                    if (!cls.__getters__) {
                        internalDesc.value = {};
                        Object.defineProperty(cls, "__getters__", internalDesc);
                    }
                    let superGetter = _superCls.__getters__ ? _superCls.__getters__[propName] : null;
                    override = superGetter && (typeof superGetter === app.TypeFunction);
                    hasSuperCall = fnTest.test(getter);
                    if (override && hasSuperCall) {
                        if (benchmark) {
                            getter = (function (name, fn) {
                                let func = function () {
                                    let t = this;
                                    let tmpSuper = t[superProp];
                                    t[superProp] = superGetter;
                                    let currTime = app.getTimer();
                                    _tmpRtn = fn.apply(t, arguments);
                                    let cost = app.getTimer() - currTime;
                                    getter.__cost = cost;
                                    if (getter.__maxCost === undefined || cost > getter.__maxCost) {
                                        getter.__maxCost = cost;
                                    }
                                    if (getter.__callCount === undefined) {
                                        getter.__callCount = 0;
                                    }
                                    getter.__callCount++;
                                    t[superProp] = tmpSuper;
                                    return _tmpRtn;
                                };
                                return func;
                            })(name, getter);
                        }
                        else {
                            getter = (function (name, fn) {
                                return function () {
                                    let t = this;
                                    let tmpSuper = t[superProp];
                                    t[superProp] = superGetter;
                                    _tmpRtn = fn.apply(t, arguments);
                                    t[superProp] = tmpSuper;
                                    return _tmpRtn;
                                };
                            })(name, getter);
                        }
                    }
                    else {
                        if (benchmark) {
                            getter = (function (name, fn) {
                                let func = function () {
                                    let currTime = app.getTimer();
                                    _tmpRtn = fn.apply(this, arguments);
                                    let cost = app.getTimer() - currTime;
                                    getter.__cost = cost;
                                    if (getter.__maxCost === undefined || cost > getter.__maxCost) {
                                        getter.__maxCost = cost;
                                    }
                                    if (getter.__callCount === undefined) {
                                        getter.__callCount = 0;
                                    }
                                    getter.__callCount++;
                                    return _tmpRtn;
                                };
                                return func;
                            })(name, getter);
                        }
                    }
                    cls.__getters__[propName] = getter;
                    //app.JsUtil.defineGetAccessor(prototype, propName, getter, false, true);
                }
                if (setter) {
                    if (!cls.__setters__) {
                        internalDesc.value = {};
                        Object.defineProperty(cls, "__setters__", internalDesc);
                    }
                    let superSetter = _superCls.__setters__ ? _superCls.__setters__[propName] : null;
                    override = superSetter && (typeof superSetter === app.TypeFunction);
                    hasSuperCall = fnTest.test(setter);
                    if (override && hasSuperCall) {
                        if (benchmark) {
                            setter = (function (name, fn) {
                                let func = function () {
                                    let t = this;
                                    let tmpSuper = t[superProp];
                                    t[superProp] = superSetter;
                                    let currTime = app.getTimer();
                                    _tmpRtn = fn.apply(t, arguments);
                                    let cost = app.getTimer() - currTime;
                                    setter.__cost = cost;
                                    if (setter.__maxCost === undefined || cost > setter.__maxCost) {
                                        setter.__maxCost = cost;
                                    }
                                    if (setter.__callCount === undefined) {
                                        setter.__callCount = 0;
                                    }
                                    setter.__callCount++;
                                    t[superProp] = tmpSuper;
                                    return _tmpRtn;
                                };
                                return func;
                            })(name, setter);
                        }
                        else {
                            setter = (function (name, fn) {
                                return function () {
                                    let t = this;
                                    let tmpSuper = t[superProp];
                                    t[superProp] = superSetter;
                                    _tmpRtn = fn.apply(t, arguments);
                                    t[superProp] = tmpSuper;
                                    return _tmpRtn;
                                };
                            })(name, setter);
                        }
                    }
                    else {
                        if (benchmark) {
                            setter = (function (name, fn) {
                                let func = function () {
                                    let currTime = app.getTimer();
                                    _tmpRtn = fn.apply(this, arguments);
                                    let cost = app.getTimer() - currTime;
                                    setter.__cost = cost;
                                    if (setter.__maxCost === undefined || cost > setter.__maxCost) {
                                        setter.__maxCost = cost;
                                    }
                                    if (setter.__callCount === undefined) {
                                        setter.__callCount = 0;
                                    }
                                    setter.__callCount++;
                                    return _tmpRtn;
                                };
                                return func;
                            })(name, setter);
                        }
                    }
                    cls.__setters__[propName] = setter;
                    app.JsUtil.defineSetAccessor(prototype, propName, setter, false, true);
                }
                if (!getter && !setter) {
                    //app.error(2001, propName);
                }
            }
            else {//基本数据类型初始化
                desc.value = obj;
                Object.defineProperty(prototype, propName, desc);
            }

            /*if (isFunc) {
                let getter, setter, propertyName;
                if (this.__getters__ && this.__getters__[propName]) {
                    propertyName = this.__getters__[propName];
                    for (let i in this.__setters__) {
                        if (this.__setters__[i] === propertyName) {
                            setter = i;
                            break;
                        }
                    }
                    app.defineGetterSetter(prototype, propertyName, prop[propName], prop[setter] ? prop[setter] : prototype[setter], propName, setter);
                }
                if (this.__setters__ && this.__setters__[propName]) {
                    propertyName = this.__setters__[propName];
                    for (let i in this.__getters__) {
                        if (this.__getters__[i] === propertyName) {
                            getter = i;
                            break;
                        }
                    }
                    app.defineGetterSetter(prototype, propertyName, prop[getter] ? prop[getter] : prototype[getter], prop[propName], getter, propName);
                }
            }*/
        }
        desc.value = null;
        internalDesc.value = null;
        app.mixinDP(prototype, map);
    };

    let Class = function () {
    };

    let finalDesc = { writable: false, enumerable: false, configurable: false };
    Class.final = function (cls) {
        internalDesc.value = true;
        Object.defineProperty(cls, '__final__', finalDesc);
    };

    /**
     * 
     * @static
     * @param {object} props
     * @return {function}
     */
    Class.extends = function (props) {
        let _superCls = this;
        if (_superCls.__final__) {
            throw new Error(_superCls.__name + " is final class!");
        }
        let _super = _superCls.prototype;
        let prototype = Object.create(_super);
        // The dummy Class constructor
        let Class = function () {
            let t = this;
            if (Class._hashable) {
                app.applyType(t);
                app.SHC(t);
            }
            app.instCount++;
            let benchmark = 0;//app.macro.BENCHMARK;
            if (benchmark) {
                if (Class.__instCount === undefined) {
                    Class.__instCount = 0;
                }
                Class.__instCount++;
                let instList = app.__instList;
                if (!instList) {
                    app.__instList = instList = [];
                }
                instList[instList.length] = t;
                if (ClassMgr.trackAlloc) {
                    console.warn("[app DEBUG] alloc inst:" + Class.__name + ":" + Class.__instCount);
                }
            }
            if (!Class.safeAlloc && !Class.__freeCountDisabled) {
                if (Class.__freeInstCount === undefined) {
                    Class.__freeInstCount = 0;
                }
                Class.__freeInstCount++;
                if (Class.__freeInstCount > 128) {
                    Class.__freeCountDisabled = true;
                    app.warn(3114, Class.__name);
                }
            }
            if (Class.__disconstruct__) {
                if (!Class.poolCall) {
                    app.error(3101, Class.__name);
                }
            }
            else {
                t.ctor.apply(t, arguments);
                if (t.__PoolObject) {
                    t.novel.apply(t, arguments);
                    t.wakeUp.apply(t, arguments);
                }
            }
        };
        Class._hashable = (Class._hashable === undefined || Class._hashable) && _superCls._hashable;
        if (Class._hashable) {
            app.applyType(Class);
            app.SHC(Class);
        }
        app.clsCount++;
        Class.__name = "SClass" + app.clsCount;
        Class.__clsHash = app.getClsHash();
        Class.forProps = function (callback, thisArg) {
            let getters = Class.__getters__;
            let setters = Class.__setters__;
            for (let name in prototype) {
                if (name === ctorProp) {
                    continue;//构造函数不作为可枚举的成员属性。
                }
                else if (name === constructorProp) {
                    continue;//构造属性不作为可枚举的成员属性。
                }
                else if (name.indexOf('__') === 0) {
                    continue;//内置变量不作为可枚举的成员属性。
                }
                else if (getters && getters[name]) {
                    continue;//getter不作为可枚举的成员属性。
                }
                else if (setters && setters[name]) {
                    continue;//setter不作为可枚举的成员属性。
                }
                let obj = prototype[name];
                callback.call(thisArg, name, obj);
            }
        };

        desc.value = app.getHashCode();
        Object.defineProperty(prototype, '__pid', desc);

        Class.prototype = prototype;

        desc.value = Class;
        Object.defineProperty(prototype, 'constructor', desc);

        // this.__getters__ && (Class.__getters__ = app.clone(this.__getters__));
        // this.__setters__ && (Class.__setters__ = app.clone(this.__setters__));

        _applyProps(_superCls, Class, props, superProp, desc, internalDesc, fnTest);

        Class.extends = app.Class.extends;
        Class.__Class = true;
        /**
         * props不仅可以是成员定义，还可以是附加实现的Class成员（意味着可以多实现）
         */
        Class.implements = function (props) {
            if (typeof props === app.TypeFunction) {
                let Class = props;
                props = {};
                let getters = Class.__getters__;
                let setters = Class.__setters__;
                let prototype = Class.prototype;
                for (let name in prototype) {
                    if (name === ctorProp) {
                        continue;//构造函数不作为实现成员属性。
                    }
                    else if (name === constructorProp) {
                        continue;//构造属性不作为实现成员属性。
                    }
                    else if (name.indexOf('__') === 0) {
                        continue;//内置变量不作为实现成员属性。
                    }
                    else if (getters && getters[name]) {
                        continue;//getter不作为实现成员属性。
                    }
                    else if (setters && setters[name]) {
                        continue;//setter不作为实现成员属性。
                    }
                    let obj = prototype[name];
                    props[name] = obj;
                }
            }
            _applyProps(_superCls, Class, props, superProp, desc, internalDesc, fnTest);
            // for (let name in props) {
            //     prototype[name] = props[name];
            // }
            return Class;
        };
        return Class;
    };

    app.Class = Class;
})();
