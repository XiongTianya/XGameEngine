
/*
 *显示对象基类
 * @Author: xty 
 * @Date: 2021-07-11 15:08:21 
 * @Last Modified by: xty
 * @Last Modified time: 2021-07-18 16:42:40
 */
app.BaseDisplay = app.Class.extends({
    __Object: true,


    /**索引数据*/
    indices: null,
    indicesBuffer: null,
    /**顶点数据*/
    vertex: null,
    vertexBuffer: null,
    /**shader程序*/
    shaders: null,
    /**缓冲区对象*/
    bufferDatas: null,
    /**每个顶点属性的组成数量*/
    bufferDataSize: null,
    /**uniform变量存放地址*/
    uniformLocations: null,
    uniformData: null,
    gl: null,


    UniformEnum: {
        uniform1f: 'uniform1f',
        uniform2f: 'uniform2f',
        uniform3f: 'uniform3f',
        uniform4f: 'uniform4f',
        uniform4f: 'uniform4f',
        uniform1fv: 'uniform1fv',
        uniform2fv: 'uniform2fv',
        uniform3fv: 'uniform3fv',
        uniform4fv: 'uniform4fv',
        uniform1i: 'uniform1i',
        uniform2i: 'uniform2i',
        uniform3i: 'uniform3i',
        uniform4i: 'uniform4i',
        uniform1iv: 'uniform1iv',
        uniform2iv: 'uniform2iv',
        uniform3iv: 'uniform3iv',
        uniform4iv: 'uniform4iv',
        uniformMatrix: 'uniformMatrix'
    },

    ctor() {
        let t = this;
        t.indices = [];
        t.vertex = [];
        t.shaders = [];
        t.bufferDatas = [];
        t.bufferDataSize = [];
        t.uniformLocations = [];
        t.uniformData = {};
        t.UniformEnum = {
            uniform1f: 'uniform1f',
            uniform2f: 'uniform2f',
            uniform3f: 'uniform3f',
            uniform4f: 'uniform4f',
            uniform4f: 'uniform4f',
            uniform1fv: 'uniform1fv',
            uniform2fv: 'uniform2fv',
            uniform3fv: 'uniform3fv',
            uniform4fv: 'uniform4fv',
            uniform1i: 'uniform1i',
            uniform2i: 'uniform2i',
            uniform3i: 'uniform3i',
            uniform4i: 'uniform4i',
            uniform1iv: 'uniform1iv',
            uniform2iv: 'uniform2iv',
            uniform3iv: 'uniform3iv',
            uniform4iv: 'uniform4iv',
            uniformMatrix: 'uniformMatrix'
        };

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



    setGl(gl) {
        this.gl = gl;
    },

    setShader(shaders) {
        this.shaders = shaders;
    },

    /**
     * 初始化shader
     */
    initShader() {
        let t = this;
        if (!initShaders(t.gl, t.shaders.vertex_texture, t.shaders.fragment_texture)) {
            return;
        }
    },

    /**
     * 设置顶点索引数据
     * @param {Array} indices 
     */
    setIndices(indices) {
        let t = this;
        t.indices = indices;
        if (!t.indicesBuffer) {
            t.indicesBuffer = t.gl.createBuffer();
        }
        t.gl.bindBuffer(t.gl.ELEMENT_ARRAY_BUFFER, t.indicesBuffer);
        t.gl.bufferData(t.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), t.gl.STATIC_DRAW);
    },


    /**
     * 设置顶点数据
     * @param {Array} vertex
     * @param {Array} pointSize 每个点占多少位 
     */
    setVertex(vertex, size) {
        let t = this;
        t.vertex = vertex;
        t.pointSize = size;
        t.createBufferData(vertex, 'a_Position', 2);
    },


    /**
     * 创建缓冲区对象
     * @param {*} data 
     * @param {*} name 
     * @param {*} size 
     */
    createBufferData(data, name, size) {
        let t = this;
        if (!t.bufferDatas[name]) {
            t.bufferDatas[name] = t.gl.createBuffer();
        }
        t.bufferDataSize[name] = size;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferDatas[name]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);

        // gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    },
    /**
    * 获取WebGLProgram对象
    * @param {object}
    */
    getWebGLProgram() {
        return this.gl.program;
    },


    /**
     * 获取顶点变量地址
     * @param {*} name 
     */
    getAttribLocation(name) {
        let t = this;
        let shaderProgram = t.getWebGLProgram();
        return t.gl.getAttribLocation(shaderProgram, name);
    },


    /**
    * 获取Uniform变量地址
    * @param {*} name 
    */
    getUniformLocation(name) {
        let t = this;
        let location = t.uniformLocations[name];
        if (location) {
            return location;
        }
        let shaderProgram = t.getWebGLProgram();
        t.uniformLocations[name] = location = t.gl.getUniformLocation(shaderProgram, name);
        return location;
    },

    /**
     * 设置Uniform数据
     * @param {object} data {key:{type,value}}
     */
    setUniformData(uniformDatas) {
        if (!uniformDatas) {
            return;
        }
        let t = this;
        for (let key in uniformDatas) {
            let uniformData = uniformDatas[key];
            this.setUniform(key, uniformData);
        }
    },

    setUniform(key, uniformData) {
        let t = this;
        let gl = t.gl;
        let type = uniformData.type;
        let value = uniformData.value;
        //const { type, value } = uniformData;
        let uniformLocation = t.getUniformLocation(key);
        if (!uniformLocation) {
            console.error('获取不到Uniform变量地址');
            return;
        }
        //const { type, value } = uniformData;
        let UniformEnum = this.UniformEnum;
        switch (type) {
            case UniformEnum.uniformMatrix:
                gl[type](uniformLocation, false, value);
                break;
            case UniformEnum.uniform1fv:
            case UniformEnum.uniform2fv:
            case UniformEnum.uniform3fv:
            case UniformEnum.uniform4fv:
            case UniformEnum.uniform1iv:
            case UniformEnum.uniform2iv:
            case UniformEnum.uniform3iv:
            case UniformEnum.uniform4iv:
                gl[type](uniformLocation, value);
            default:
                gl[type](uniformLocation, value[0] || value, value[1], value[2], value[3]);
                break;
        }
    },

    pointLen: {
        get() {
            let t = this;
            if (!t.vertex) {
                return 0;
            }
            return t.vertex.length / t.pointSize;
        }
    },

    pointSize: {
        get() {
            return this.pointSize || 0;

        }
    },

    // get pointSize() {
    //     return this.pointSize || 0;
    // },

    /**
    * 销毁
    */
    destory() {
        let shaders = this.gl.getAttachedShaders(this.shaderProgram);
        shaders.forEach((item) => {
            this.gl.deleteShader(item);
        });
        this.gl.deleteBuffer(this.indicesPointer);
        this.gl.deleteProgram(this.shaderProgram);
        this.parent = undefined;
        this.dispose();
    },

    /**
     * 释放buffer
     */
    dispose() {
        let t = this;
        for (let key in t.bufferDatas) {
            t.gl.deleteBuffer(t.bufferDatas[key]);
        }
    },



    // setConfig(config) {
    //     if (!config) {
    //         return;
    //     }
    //     let xGL = config.xGL;
    //     if (xGL) {
    //         xGL.canvas.add(this);
    //         this.gl = xGL.gl;
    //     }
    //     if (config.shaders) {
    //         this.shaders = config.shaders;
    //     }
    // }




    // setTexture(texture, key = 'u_Sample') {
    //     this.uniformData[key] = {
    //         type: 'uniform1i',
    //         value: 0,
    //         texture: texture,
    //     }
    //     this.texture = texture;
    // }



    /**
     * 加载shader
     * @param {string} str shader程序 
     * @param {*} type 类型
     */
    // loadShader(str, type) {
    //     let t = this;
    //     let shader = t.gl.createShader(type);
    //     t.gl.shaderSorce(shader, str);
    //     t.gl.compileShader(shader);
    //     return shader;
    // }











    render() {
        let t = this;
        let gl = t.gl;
        let bufferDatas = t.bufferDatas;
        for (let key in bufferDatas) {
            let data = bufferDatas[key];
            let a_Position = t.gl.getAttribLocation(t.gl.program, key);
            t.gl.bindBuffer(t.gl.ARRAY_BUFFER, data);
            t.gl.vertexAttribPointer(a_Position, t.bufferDataSize[key], t.gl.FLOAT, false, 0, 0);
            t.gl.enableVertexAttribArray(a_Position);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        let shaderProgram = t.getWebGLProgram();
        gl.useProgram(shaderProgram);
        //if (this.vertex.length) { this.gl.drawArrays(this.gl[this.drawType], this.offset, vLen); }

        // bufferDatas.forEach(function (data, key) {
        //     let a_Position = gl.getAttribLocation(t.gl.program, key);
        //     t.gl.bindBuffer(t.gl.ARRAY_BUFFER, data);
        //     t.gl.vertexAttribPointer(a_Position, t.buffersSize[key], t.gl.FLOAT, false, 0, 0);
        //     t.gl.enableVertexAttribArray(a_Position);
        // });
    }


});







//export default BaseDisplay;



//-----------笔记--------------
//gl.vertexAttribPointer():告诉显卡从当前的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据
//`${}` 字符串拼接