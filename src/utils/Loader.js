
let Loader = app.Loader = function () { };
/**
 * 加载资源
 * @param  {} url
 * @param  {} option={}
 */
Loader.load = function (url, option = {}) {
    if (option.type === 'image') {
        return loadImage(url);
    }
    option = Object.assign({
        method: 'GET',
        headers: {}
    }, option);
    return fetch(url, { ...option }).then(res => {
        if (option.responseType) {
            return res[option.responseType]();
        }
        return res.json();
    });
}
/**
 * 加载图片
 * @param  {} url
 */
Loader.loadImage = function (url) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.src = url;
        image.onload = () => {
            resolve(image);
        };
        image.onerror = (e) => {
            reject(e);
        };
    });
}
