function main() {
    let TypeUndefined = "undefined";

    app.TypeUndefined = TypeUndefined;
    app.TypeFunction = "function";
    app.TypeObject = "object";
    app.TypeNumber = "number";
    app.TypeBoolean = "boolean";
    app.TypeString = "string";

    var clsHash = 0;
    app.getClsHash = function () {
        return ++clsHash;
    };

    var funcHash = 0;
    app.getFuncHash = function (thisArg) {
        if (thisArg) {
            let hash = thisArg.hashCode;
            if (hash === undefined) {
                hash = app.AHC(thisArg, ++instHash);
            }
            let func = funcHashByInst[hash];
            if (!func) {
                func = funcHashByInst[hash] = 0;
            }
            return funcHashByInst[hash] = ++func;
        }
        else {
            return ++funcHash;
        }
    };

    var instHash = 0;
    app.getInstHash = function (thisArg) {
        if (thisArg) {
            let hash = thisArg.hashCode;
            if (hash === undefined) {
                hash = app.AHC(thisArg, ++instHash);
            }
            let inst = instHashByThis[hash];
            if (!inst) {
                inst = instHashByThis[hash] = 0;
            }
            return instHashByThis[hash] = ++inst;
        }
        else {
            return ++instHash;
        }
    };

    var hashCode = 0;
    app.getHashCode = function () {
        return ++hashCode;
    };

    app.applyType = function (obj) {
        if (!obj) {
            return false;
        }
        if (obj.charCodeAt) {//string
            return false;
        }
        if (obj.__InitedType) {
            return true;
        }
        let type = typeof obj;
        if (type === app.TypeFunction) {
            obj.__TypeFunction = true;
        }
        else if (type === app.TypeObject) {
            obj.__TypeObject = true;
        }
        else {
            return false;
        }
        obj.__InitedType = true;
        return true;
    };

    let AHCDesc = { enumerable: false, configurable: false, writable: false };
    //Apply Hash Code.
    app.AHC = function (obj, code) {
        if (obj.hashCode !== undefined) {
            return;
        }
        //返回此对象唯一的哈希值，hashCode为大于0的整数。
        AHCDesc.value = code;
        Object.defineProperty(obj, "hashCode", AHCDesc);
    };

    app.SHC = function (obj) {
        if (obj.hashCode !== undefined) {
            return;
        }
        app.applyType(obj);
        if (obj.__TypeFunction) {
            app.AHC(obj, app.getFuncHash());
        }
        else if (obj.__TypeObject) {
            app.AHC(obj, app.getInstHash());
        }
    };
    app.SHC(app);

    /**
    * 获取属性别名
    * @param {*} originName 原始属性名
    */
    app.getAliasName = function (originName) {
        let aliasMap = _aliasMap;
        let aliasName = aliasMap && aliasMap[originName];
        return aliasName || originName;
    };
    let aliasFlag = '_$';
    let dynamicAliasFlag = '$$';
    /**
     * getNormalProp
     * 获取标准化的属性名称
     * @param {Boolean} strict 属性必须添加控制标识时启用严格模式
     */
    app.getNormP = function (prop, strict) {
        if (prop.indexOf(aliasFlag) === 0) {
            prop = prop.substr(2);
        }
        else if (strict) {
            //app.warn(6008, prop);
        }
        return prop;
    };
    /**
     * getNormalDynamicProp
     * 获取标准化的动态属性名称
     * @param {Boolean} strict 动态属性必须添加控制标识时启用严格模式
     */
    app.getNormDP = function (prop, strict) {
        if (prop.indexOf(dynamicAliasFlag) === 0) {
            prop = prop.substr(2);
        }
        else if (strict) {
            //app.warn(6007, prop);
        }
        return prop;
    };
    /**
     * FixedPropValue
     * 调用第三方接口时使用
     */
    app.getFPV = function (obj, prop) {
        return obj[prop];
    };
    app.setFPV = function (obj, prop, value) {
        obj[prop] = value;
    };
    /**
     * DynamicPropValue
     * 该接口在设计时遵循传原始名得到别名，传别名还是别名的规则，该规则不能变，否则项目层会有较大调整！
     * 顶级NS（app，game）、配置对象、第三方对象中获取属性时使用非动态名称，不会校验是否动态名称合法；
     * 继承引擎对象的成员属性会校验是否动态名称合法，自定义属性并且该属性名称需要动态组合时，属性定义的地方需要加上控制标识。
     */
    app.getDPV = function (obj, prop) {
        prop = app.getAliasName(prop) || prop;
        if (obj.__Object || obj.__Enum) {
            if (!obj.isDynamicProp(prop)) {
                app.warn(6007, prop);
            }
        }
        return obj[prop];
    };
    app.setDPV = function (obj, prop, value) {
        prop = app.getAliasName(prop) || prop;
        if (obj.__Object || obj.__Enum) {
            if (!obj.isDynamicProp(prop)) {
                app.warn(6007, prop);
            }
        }
        obj[prop] = value;
    };
    //
    let desc = { writable: true, enumerable: true, configurable: true };
    app.mixinDP = function (obj, map) {
        desc.value = function (prop) {
            return !!map[prop];
        };
        Object.defineProperty(obj, "isDynamicProp", desc);
        desc.value = null;
    };
    // //
    // app.getLoop = function () {
    //     if (!app.loop) {
    //         app.loop = new app.Loop();
    //     }
    //     return app.loop;
    // };

    let JsUtil = app.JsUtil = {};

    /**
 * @method set
 * @param {Object} obj
 * @param {String} prop
 * @param {Function} setter
 * @param {Boolean} [enumerable=false]
 * @param {Boolean} [configurable=false]
 */
    JsUtil.defineSetAccessor = function (obj, prop, setter, enumerable, configurable) {
        tmpSetDesc.set = setter;
        tmpSetDesc.enumerable = !!enumerable;
        tmpSetDesc.configurable = !!configurable;
        Object.defineProperty(obj, prop, tmpSetDesc);
        tmpSetDesc.set = null;
    };
}