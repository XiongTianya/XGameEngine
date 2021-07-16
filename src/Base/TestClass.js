app.Object = app.Class.extends({

    __Object: true,

    ctor() {
        // let self = this;
        // b8e.Object.prototype.ctor.call(self);
        console.log('这是 一个类');
    },

    getClass() {
        return this.constructor;//Object.getPrototypeOf(t).constructor;
    },

    getClassName() {
        return this.getClass().__name;
    },

    serialization() {
    },

    deserailization() {
    },

    destroy() {
    }
});

// b8e.Object.create = function () {
//     return new b8e.Object();
// };
