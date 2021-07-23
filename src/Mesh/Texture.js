
let Texture = app.Texture = app.BaseDisplay.extends({
    __Object: true,

    _x: 0,
    _y: 0,
    ctor() {
        let t = this;
        t._super();
        let shaderLib = app.ShaderLib;
        let shaders = {
            vertex_texture: shaderLib.vertex_texture,
            fragment_texture: shaderLib.fragment_texture
        }
        t.setShader(shaders);
    },

    load(url, onComplete, thisArgs, args) {
        app.LoadUtils.loadTexture(this.gl, url).then((config) => {
            let t = this;
            if (onComplete) {
                onComplete.call(thisArgs, args);
            }
            let texture = config.texture;
            t.width = config.width;
            t.height = config.height;
            t.texture = texture;
            t.uniformData['u_Sampler'] = {
                type: 'uniform1i',
                value: 0,
            }
            t.setData();
            t.loadComplete();
        })
    },

    loadComplete() {

    },


    setConfig(config) {
        if (!config) {
            return;
        }
        //super(config);
        this.shaders = {
            vertex_texture: ShaderLib.vertex_texture,
            vertex_texture: ShaderLib.fragment_texture
        }
    },

    // setImage(path) {
    //     this.texture = load(this.gl, path);
    // }

    setPosition(x, y) {
        let t = this;
        t._x = x;
        t._y = y;
        if (t.texture) {
            t.setData();
        }
    },

    setPoints(points){
        this.points = points;
    },

    setData() {
        let t = this;
        // const { width, height, src, texture, x = 0, y = 0 } = data;
        // if (src) {
        //     t.setImage();
        // }
        // if (texture) {
        //     this.setTexture(texture);
        // }
        let texture = t.texture;
        if (!texture) {
            return;
        }
        let width = texture.width;
        let height = texture.height;
        // 计算uv
        // const points = [
        //     t._x, t._y,
        //     t._x, t._y + t.height,
        //     t._x + t.width, t._y,
        //     t._x + t.width, t._y + t.height
        // ];

        // const points = [
        //   -0.5,-0.5,
        //   -0.5,0.5,
        //   0.5,-0.5,
        //   0.5,0.5
        // ];
        const indices = [0, 1, 2, 2, 3, 0];
        const uv = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ];

        //this.vertex = points;
        //this.setBufferData(points, 'position', 2);
        this.initShader();
        this.setVertex(t.points);
        this.createBufferData(uv, 'a_TexCoord', 2);
        this.setIndices(indices);

        t.render();
    },

    render() {
        let t = this;
        t.setUniformData(t.uniformData);

        t._super();
        let gl = this.gl; 
        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.activeTexture(gl.TEXTURE0);
        //gl.clear(gl.COLOR_BUFFER_BIT);
    
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); //绘制矩形
    }

})
