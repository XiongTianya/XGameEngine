import BaseDisplay from './BaseDisplay';
import ShaderLib from '../Shaders/ShaderLib';
import loadTexture from '../utils/LoadUtils';

class Texture extends BaseDisplay {

    _x = 0;
    _y = 0;
    constructor() {
        let t = this;
        t.shaders = {
            vertex_texture: ShaderLib.vertex_texture,
            vertex_texture: ShaderLib.fragment_texture
        }
        t.setShader();
    }

    load(url, onComplete, thisArgs, args) {
        loadTexture(this.gl, url).then((texture) => {
            onComplete.call(thisArgs, args);

            t.texture = texture;
            this.uniformData['u_Sample'] = {
                type: 'uniform1i',
                value: 0,
            }
            this.setData();
            this.loadComplete();
        })
    }

    loadComplete() {

    }


    setConfig(config) {
        if (!config) {
            return;
        }
        //super(config);
        this.shaders = {
            vertex_texture: ShaderLib.vertex_texture,
            vertex_texture: ShaderLib.fragment_texture
        }
    }

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
    }

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
        const points = [
            t._x, t._y,
            t._x, t._y + height,
            t._x + width, y,
            t._x + width, y + height
        ];
        const indices = [0, 1, 2, 2, 1, 3];
        const uv = [
            0, 0,
            0, 1,
            1, 0,
            1, 1
        ];

        //this.vertex = points;
        //this.setBufferData(points, 'position', 2);
        this.setVertex(points);
        this.setBufferData(uv, 'uv', 2);
        this.setIndices(indices);

        t.render();
    }

    render() {
        let t = this;
        let gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        t.setUniformData(t.uniformData);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, t.pointSize); //绘制矩形
    }

}
export default Texture;
