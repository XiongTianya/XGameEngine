//import Texture from "./src/Mesh/Texture";

let test = app.Class.extends({
    __Object: true,

    ctor() {
        // let self = this;
        // b8e.Object.prototype.ctor.call(self);
        console.log('这是 一个类');
    },

    show() {
        var canvas = document.getElementById('webgl');
        var gl = getWebGLContext(canvas);
        if (!gl) {
            console.error('获取不到gl');
            return
        }
        let texture = new app.Texture();
        texture.setGl(gl);
        texture.load('anim1.png');
    }

});

//export default test;
