import * as Three from 'three';
import { CircleGeometry } from './CircleGeometry';

export interface MainVisual {
    numCircle: number;
    circleWidth: number;
    numTextureGridCols: number;
    textureGridSize: number;
    canvas: HTMLCanvasElement;
    screenWidth: number;
    screenHeight: number;
    renderer: Three.WebGLRenderer;
    scene: Three.Scene;
    camera: Three.PerspectiveCamera;
    material: Three.ShaderMaterial;
}

export class ThreeJsTest3 implements MainVisual {

    numCircle: number = 1000;
    circleWidth: number = 4;
    numTextureGridCols: number = 16;
    textureGridSize: number = 128;

    canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
    screenWidth: number = window.outerWidth;
    screenHeight: number = window.outerHeight;

    /** レンダラー作成 */
    renderer: Three.WebGLRenderer = new Three.WebGLRenderer();

    /** シーン作成(3D空間) */
    scene: Three.Scene = new Three.Scene();

    /** カメラ作成 */
    camera: Three.PerspectiveCamera = new Three.PerspectiveCamera();

    material: Three.ShaderMaterial = new Three.ShaderMaterial();

    circleGeometry: CircleGeometry;

    constructor (numCircle: number, circleWidth: number, numTextureGridCols: number, textureGridSize: number) {
        this.numCircle = numCircle;
        this.circleWidth = circleWidth;
        this.numTextureGridCols = numTextureGridCols;
        this.textureGridSize = textureGridSize;
        this.init();
        window.addEventListener('resize', (event: Event) => {
            this.resize();
        });
        this.circleGeometry = new CircleGeometry(this.circleWidth, this.numCircle);
        this.createMesh();
        console.log(this.camera);
        this.animationStart();
    }

    /**
     * 初期化処理
     */
    init ():void {
        this.canvas.width = this.screenWidth;
        this.canvas.height = this.screenHeight;
        // this.renderer.domElement = this.canvas;
        this.renderer = new Three.WebGLRenderer({
            canvas: this.canvas
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.screenWidth, this.screenHeight);

        this.scene = new Three.Scene();

        this.camera = new Three.PerspectiveCamera(35, this.screenWidth / this.screenHeight, 10, 2000);
        this.camera.position.set(0, 0, 500);
    }

    /**
     * リサイズイベント用メソッド 
    */
    resize ():void {
        this.screenWidth = window.outerWidth;
        this.screenHeight = window.outerHeight;
        this.camera.aspect = this.screenWidth / this.screenHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.screenWidth, this.screenHeight);
    }

    setUniform (uniformKey: string, value: any):void {
        this.material.uniforms[uniformKey].value = value;
    }

    createMesh():void {
        const geometry: Three.BufferGeometry = this.circleGeometry.geometry;
        this.material.setValues({
            transparent: true,
            side: Three.DoubleSide,
            uniforms: {

                time: { value: 0},
                numCircle: {value: this.numCircle},
                numTextureGridCols:{value: this.numTextureGridCols},
                numTextureGridRows:{value: 1}
            },
            blending: Three.AdditiveBlending,
            vertexShader: this.vertexShaderObj(),
            fragmentShader: this.fragmentShaderObj()
        });
        const mesh = new Three.Mesh(geometry, this.material);
        this.scene.add(mesh);
    }

    vertexShaderObj (): string {
        let vertexShader: string =
        `   varying vec4 vColor;
            varying vec2 vUv;
            uniform float time; //経過時間
            uniform float numCircle; // 円の数
            uniform float numTextureGridRows;
            uniform float numTextureGridCols;
            //attribute vec3 position; // 座標
            attribute vec3 randomValues; // ランダム値
            //attribute vec2 uv; // uv座標
            attribute float circleIndex; // 何番目の正方形に属するか
            const float PI = 3.1415926535897932384626433832795;

            // 範囲を設定し直す
            float map(float value, float inputMin, float inputMax, float outputMin, float outputMax, bool clamp) {
                if(clamp == true) {
                  if(value < inputMin) return outputMin;
                  if(value > inputMax) return outputMax;
                }
            
                float p = (outputMax - outputMin) / (inputMax - inputMin);
                return ((value - inputMin) * p) + outputMin;
            }

            // time, scale, offsetを使って角度を返す
            // 範囲は -PI ~ PI
            float getRad(float scale, float offset) {
                return map(mod(time * scale + offset, PI * 2.0), 0.0, PI * 2.0, -PI, PI, true);
            }

            // 3次元ベクトルを任意の軸で回転
            vec3 rotateVec3(vec3 p, float angle, vec3 axis) {
                vec3 a = normalize(axis);
                float s = sin(angle);
                float c = cos(angle);
                float r = 1.0 - c;
                mat3 m = mat3(
                    a.x * a.x * r + c,
                    a.y * a.x * r + a.z * s,
                    a.z * a.x * r - a.y * s,
                    a.x * a.y * r - a.z * s,
                    a.y * a.y * r + c,
                    a.z * a.y * r + a.x * s,
                    a.x * a.z * r + a.y * s,
                    a.y * a.z * r - a.x * s,
                    a.z * a.z * r + c
                );
                return m * p;
            }

            // 距離から透明度を計算
            float getAlpha(float distance) {
                float da = abs(distance - 400.0) / 500.0;
                return clamp(1.0 - da, 0.0, 1.0);
            }

            vec3 hsv2rgb (vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main () {
                vec3 pos = position;
                float theta;

                // アニメーションの半径
                float radius = 80.0;

                pos -= position;
                theta = getRad(4.0, (randomValues.x + randomValues.y + randomValues.z) * 20.0);
                pos.z += (radius + radius * map(sin(theta), -1.0, 1.0, 0.0, 1.0, true));
                theta = getRad(4.0, randomValues.x * 20.0);
                pos = rotateVec3(pos, theta, vec3(0.0, 1.0, 0.0));
                theta = getRad(4.0, randomValues.y * 20.0);
                pos = rotateVec3(pos, theta, vec3(1.0, 0.0, 0.0));
                theta = getRad(4.0, randomValues.z * 20.0);
                pos = rotateVec3(pos, theta, vec3(0.0, 0.0, 1.0));

                //
                // フラグメントシェーダに渡すUV座標変換
                //

                float texCircleIndex = mod(circleIndex, numCircle);

                // 横方向のグリッド単位
                float uUnit = 2.0 / texCircleIndex;
                // 縦方向のグリッド単位
                float vUnit = 2.0 / texCircleIndex;
                vUv = vec2(
                    (uv.x - 0.5),
                    (uv.y - 0.5)
                );
                // vUv = uv * uUnit;

                //
                // 最終的な座標とフラグメントシェーダに渡す色を計算
                //

                // モデル座標変換
                vec4 modelPos = modelMatrix * vec4(pos, 1.0);
                // ビュー変換
                vec4 modelViewPos = viewMatrix * modelPos;

                modelViewPos += vec4(position, 0.0);

                // プロジェクション変換した座標をgl_Positionに代入
                gl_Position = projectionMatrix * modelViewPos;

                // カメラからの距離を算出
                float d = distance(cameraPosition, modelPos.xyz);

                // フラグメントシェーダに渡すcolorを計算
                vColor = vec4(
                    hsv2rgb(
                        vec3(
                            (sin(getRad(2.0, randomValues.x * 2.0)) + 1.0) * 0.5,
                            0.9,
                            0.8
                        )
                    ),
                    getAlpha(d)
                );
            }
        `;
        return vertexShader;
    }

    fragmentShaderObj () : string {
        let fragmentShader: string =
        `   varying vec4 vColor; // 円の色
            varying vec2 vUv;    // uv座標

            void main() {
                vec2 uv = vUv;
                vec2 center = vec2(uv.x * 0.5, uv.y * 0.5);
                float radius = 0.05;
                float lightness = radius / length(uv - center);
                // float lightness = radius * length(uv - center);
                // lightness = clamp(lightness, 0.0, 1.0);
                vec4 color = vec4(vec3(lightness), 1.0);
                // vec4 color = vec4(vec3(uv.x, uv.y, 0.5), 1.0);
                // vec4 color = vec4(0.2, 0.5, 1.0, 1.0);
                // color *= vec4(0.2, 0.5, 1.0, 1.0);
                color *= vColor;
                if (color.r <= 0.2 || color.g <= 0.2 || color.b <= 0.2) {
                    discard;
                } else {
                    gl_FragColor = color;
                }
                // if (color.r >= 0.95 || color.g >= 0.95 || color.b >= 0.95) {
                //     discard;
                // } else {
                //     gl_FragColor = color;
                // }
                // gl_FragColor = color;
            }
        `;
        return fragmentShader;
    }

    animationStart ():void {
        const sec = performance.now() / 6000;
        this.setUniform('time', sec);
        this.camera.lookAt(new Three.Vector3(0, 0, 0));
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => {this.animationStart()});
    }
}