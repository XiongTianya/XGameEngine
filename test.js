//import Texture from "./src/Mesh/Texture";

let test = app.Class.extends({
    __Object: true,

    ctor() {
        // let self = this;
        // b8e.Object.prototype.ctor.call(self);
        console.log('这是 一个类');
    },
    textures:[],
    show() {
        let t=this;
        t.textures=[];
        let container =document.querySelector("#root");
        let canvas = document.createElement('canvas');
		container.appendChild(canvas);

        //var canvas = document.getElementById('webgl');
        let contextOption= {
            alpha: true,
            antialias: true,
            antialiasSamples: 16,
            premultipliedAlpha: false,
            stencil: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true
        }
        var gl = canvas.getContext('webgl2', contextOption);//getWebGLContext(canvas,contextOption);
        if (!gl) {
            console.error('获取不到gl');
            return
        }
        let texture = new app.Texture();
        t.textures.push(texture);
        texture.setGl(gl);
        texture.setPoints( [
            -0.5,-0.5,
            -0.5,0.5,
            0,-0.5,
            0,0.5
          ]);
        texture.load('sky.jpg');

        let texture2 = new app.Texture();
        t.textures.push(texture2);
        texture2.setGl(gl);
        texture2.setPoints( [
            0,-0.5,
            0,0.5,
            0.5,-0.5,
            0.5,0.5
          ]);
        texture2.load('anim1.png');     
        
        //this.update();
    },

    update(){
        const time = new Date().getTime();
        const delta = time - this.beforeTime;
        this.beforeTime = time;
        if(this.testRender){
            this.testRender();

        }
        requestAnimationFrame(this.update);

    },

    testRender(){
        for(let i=0;i<this.textures.length;i++){
            this.textures[i].render();
        }
    }

});

//export default test;
