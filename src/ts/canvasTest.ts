export class CanvasTest {

    private wrap: HTMLElement;
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    constructor () {
        this.wrap = <HTMLElement>document.getElementById('wrapper');

        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');

        this.canvas.width = this.wrap.offsetWidth;
        this.canvas.height = this.wrap.offsetHeight;

        this.gl = <WebGL2RenderingContext>this.canvas.getContext('webgl2');

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);　// 画面カラーの初期化
        this.gl.clear(this.gl.COLOR_BUFFER_BIT); // 画面の初期化

    }
}