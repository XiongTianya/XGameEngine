/*
 * @Author: xty 
 * @Date: 2021-07-12 20:13:53 
 * @Last Modified by: xty
 * @Last Modified time: 2021-07-16 19:30:31
 */
let ShaderLib = app.ShaderLib = {
    vertex_texture:
        'attribute vec4 a_Position;\n' +
        'attribute vec2 a_TexCoord;\n' +
        'varying vec2 v_TexCoord;\n' +
        'void main() {\n' +
        '   gl_Position = a_Position;\n' +
        '   v_TexCoord = a_TexCoord;\n' +
        '}\n',

    fragment_texture:
        '#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        '#endif\n' +
        'uniform sampler2D u_Sampler;\n' +
        'varying vec2 v_TexCoord;\n' +
        'void main() {\n' +
        '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
        '}\n'

}