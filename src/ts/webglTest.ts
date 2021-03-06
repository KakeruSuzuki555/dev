export class WebglTest {

    private wrap: HTMLElement;
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;

    private vShaderSouce: string;
    private fShaderSouce: string;
    constructor () {
        this.wrap = <HTMLElement>document.getElementById('wrapper');
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
        this.canvas.width = this.wrap.offsetWidth;
        this.canvas.height = this.wrap.offsetHeight;
        // コンテキストの取得
        this.gl = <WebGL2RenderingContext>this.canvas.getContext('webgl2');

        // 各シェーダのソース取得
        this.vShaderSouce = this.vertexShaderObj();
        this.fShaderSouce = this.fragmentShaderObj();

        // vertexShaderの生成からコンパイルまで
        const vertexShader: WebGLShader = <WebGLShader>this.gl.createShader(this.gl.VERTEX_SHADER);
        this.createVertexShader(vertexShader);

        // fragmentShaderの生成からコンパイルまで
        const fragmentShader: WebGLShader = <WebGLShader>this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.createFragmentShader(fragmentShader);

        // fragmentShaderとvertexShaderのリンク
        const program: WebGLProgram = <WebGLProgram>this.gl.createProgram();
        this.linkVertexAndFragment(program, vertexShader, fragmentShader);

        // プログラムを有効化
        this.gl.useProgram(program);

        // 位置情報のバッファー作成
        const vertexBuffer: WebGLBuffer = <WebGLBuffer>this.gl.createBuffer();
        // 色情報のバッファー作成
        const colorBuffer: WebGLBuffer = <WebGLBuffer>this.gl.createBuffer();
        // shaderの変数有効化
        this.enableVariable(program, vertexBuffer, colorBuffer);

        this.forwardDataOfShader(vertexBuffer, colorBuffer);

        // 四角形の描画
        const VERTEX_NUMS = 6;
        this.gl.drawArrays(this.gl.TRIANGLES, 0, VERTEX_NUMS);

        // webgl描画
        this.gl.flush();

        // this.gl.clearColor(0.0, 0.0, 0.0, 1.0);　// 画面カラーの初期化
        // this.gl.clear(this.gl.COLOR_BUFFER_BIT); // 画面の初期化

    }

    vertexShaderObj (): string {
        let vertexShader: string =
        `   #version 300 es
            // ↑一行目に必ず記述

            // jsから入力される値は必ずinで定義
            // 頂点座標：x、y、z の3要素のベクトル
            // 頂点色：r、g、b、a　の4要素のベクトル
            in vec3 vertexPosition;
            in vec4 color;

            // このシェーダからフラグメントシェーダに対して出力する変数をoutで定義
            out vec4 vColor;

            void main () {
                // 頂点座標を決定するにはgl_Position変数へ書き込む
                // 頂点座標はx、y、z、wの4つになるためvec3からvec4へ変換
                vColor = color;
                gl_Position = vec4(vertexPosition, 1.0);
            }
        `;
        return vertexShader;
    }

    fragmentShaderObj () : string {
        let fragmentShader: string =
        `   #version 300 es
            // float の精度を指定する
            // lowp midiump highp etc.
            precision highp float;

            // vertexShaderから受け取る変数をinで指定
            in vec4 vColor;

            // 画面に出力する色の変数を宣言していく
            // r、g、b、aの vec4
            out vec4 fragmentColor;

            void main() {
                fragmentColor = vColor;
            }
        `;
        return fragmentShader;
    }

    createVertexShader(vertexShader: WebGLShader): void {
        this.gl.shaderSource(vertexShader, this.vShaderSouce);
        this.gl.compileShader(vertexShader);
        // コンパイルチェック
        const vShaderCompileStatus = this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS);
        if (!vShaderCompileStatus) {
            const info = this.gl.getShaderInfoLog(vertexShader);
            console.log(info);
        }
    }

    createFragmentShader(fragmentShader: WebGLShader): void {
        this.gl.shaderSource(fragmentShader, this.fShaderSouce);
        this.gl.compileShader(fragmentShader);
        // コンパイルチェック
        const fShaderComileStatus = this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS);
        if (!fShaderComileStatus) {
            const info = this.gl.getShaderInfoLog(fragmentShader);
            console.log(info);
        }
    }

    linkVertexAndFragment(program: WebGLProgram, vertexShader: WebGLShader, fragmentShader: WebGLShader): void {
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        const linkStatus = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        // リンクチェック
        if (!linkStatus) {
            const info = this.gl.getProgramInfoLog(program);
            console.log(info);
        }
    }

    enableVariable(program: WebGLProgram, vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer): void {
        // vertexShaderのin変数の位置を取得
        const vertexAtttibLocation = this.gl.getAttribLocation(program, 'vertexPosition');
        const colorAttribLocation = this.gl.getAttribLocation(program, 'color');

        const vertexSize = 3; // vec3
        const colorSize = 4; // vec4

        // in変数を有効化
        // 位置情報のバッファーのバインド
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.enableVertexAttribArray(vertexAtttibLocation);
        this.gl.vertexAttribPointer(vertexAtttibLocation, vertexSize, this.gl.FLOAT, false, 0, 0);
        // 色情報のバッファーのバインド
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(colorAttribLocation);
        this.gl.vertexAttribPointer(colorAttribLocation, colorSize, this.gl.FLOAT, false, 0, 0);
    }

    forwardDataOfShader( vertexBuffer: WebGLBuffer, colorBuffer: WebGLBuffer): void {
        /** データの作成 */
        // 頂点情報
        // vec3なので3つずつ
        const vertices = new Float32Array([
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.5, 0.5, 0.0
        ]);
        // 色情報
        // vec4なので4つずつ
        const colors = new Float32Array([
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
        ]);

        // バインドしてデータを転送
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);
    }
}