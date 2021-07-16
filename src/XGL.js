class MiniGL extends Base {
    constructor(config) {
        this.container = config.container;
        this.config = Object.assign({
            contextOption: {
                alpha: true,
                antialias: true,
                antialiasSamples: 16,
                premultipliedAlpha: false,
                stencil: true,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: true
            }
        }, config);
    }

    init() {
        const { contextOption = {} } = this.config;
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);

        this.gl = this.canvas.getContext('webgl2', contextOption);
        if (this.gl == null) {
            return console.error('你的浏览器不支持webgl2,请更新使用chrome浏览器');
        }

        this.viewport = new Viewport({ miniGL: this, ...this.config });
        this.viewport.resize();
        this.canvas = new Canvas({ miniGL: this, ...this.config });
        this.controller = new Controller({ miniGL: this, ...this.config });

        this.canvas.update();
    }

}