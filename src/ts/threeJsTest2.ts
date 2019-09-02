import * as THREE from 'three';
import { Vec2, ShaderMaterial } from 'three';

export class ThreeJsTest2 {

    private wrap: HTMLElement;
    private canvas: HTMLCanvasElement;

    /** レンダラー作成 */
    private renderer: THREE.WebGLRenderer;

    /** シーン作成(3D空間) */
    private scene: THREE.Scene;

    /** カメラ作成 */
    private camera: THREE.PerspectiveCamera;

    /** 箱を作成 */
    // private boxGeometry: THREE.BoxGeometry;
    // private sphereGeometry: THREE.SphereGeometry;
    // private material: THREE.MeshNormalMaterial;
    // private box: THREE.Mesh;

    /** 平行光源 */
    private directionalLight: THREE.DirectionalLight;

    /** 回転の値 */
    private rot: number = 0;

    private mouseX: number = 0;

    private pointMesh: THREE.Points; 

    private uniforms: any;

    constructor(){

        this.wrap = <HTMLElement>document.getElementById('wrapper');

        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');

        this.canvas.width = this.wrap.offsetWidth;
        this.canvas.height = this.wrap.offsetHeight;

        this.uniforms = {
            uAspect: {
                value: this.canvas.width / this.canvas.height
            },
            uTime: {
                value: 0.0
            }
        }

        /** イベントセット */
        this.mouseEvent();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.wrap.offsetWidth, this.wrap.offsetHeight);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, this.wrap.offsetWidth / this.wrap.offsetHeight);
        this.camera.position.set(0, 0, +1000);

        const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        const material: THREE.ShaderMaterial = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShaderObj(),
            fragmentShader: this.fragmentShaderObj(),
            wireframe: false
        });
        // this.sphereGeometry = new THREE.SphereGeometry(300, 30, 30);
        // this.material = new THREE.MeshStandardMaterial({color:0xFF0000});
        // this.box = new THREE.Mesh(this.sphereGeometry, this.material);
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.pointMesh = new THREE.Points();
        this.createStarField();
        this.directionalLight = new THREE.DirectionalLight(0xFFFFFF);
        this.directionalLight.position.set(1, 1, 1);


        this.scene.add(this.directionalLight);
        this.tick();
    }

    mouseEvent () {
        document.addEventListener("mousemove", (event) => {
            this.mouseX = event.pageX;
        })
    }

    createStarField () {

        const geometry: THREE.Geometry = new THREE.Geometry();
        for (let i = 0; i < 1000; i++) {
            geometry.vertices.push(
                new THREE.Vector3(
                    3000 * (Math.random() - 0.5),
                    3000 * (Math.random() - 0.5),
                    3000 * (Math.random() - 0.5)
                )
            );
        }

        const material: THREE.PointsMaterial = new THREE.PointsMaterial({
            size: 10,
            color: 0xffffff
        });
        this.pointMesh.geometry = geometry;
        this.pointMesh.material = material;
        // this.pointMesh = new THREE.Points(geometry, material);
        this.scene.add(this.pointMesh);
    }

    vertexShaderObj (): string {
        let vertexShader: string =
        `   varying float vSample;
            varying vec2 vUv;

            void main () {
                vSample = 1.0;
                vUv = uv;
                vec3 pos = position;
                // pos.y = (pos.y * 0.5) + sin(pos.x * 3.0) * 0.5;
                // 頂点座標を決定するにはgl_Position変数へ書き込む
                // 頂点座標はx、y、z、wの4つになるためvec3からvec4へ変換
                gl_Position = vec4(pos, 1.0);
            }
        `;
        return vertexShader;
    }

    fragmentShaderObj () : string {
        let fragmentShader: string =
        `   varying float vSample;
            varying vec2 vUv;
            uniform float uAspect; // 画面のアスペクト比率
            uniform float uTime;
            void main() {
                vec2 uv = vec2(vUv.x * uAspect, vUv.y);
                vec2 center = vec2(0.5 * uAspect, 0.5);
                float radius = 0.05 + sin(uTime * 2.0) * 0.025;
                float lightness = radius / length(uv - center);
                vec4 color = vec4(vec3(lightness), 1.0);
                color *= vec4(0.2, 0.5, 1.0, 1.0);
                gl_FragColor = color;
            }
        `;
        return fragmentShader;
    }

    tick () {
        // マウスの位置に応じて角度を設定
        // マウスのX座標がステージに対して何％の位置にあるか調べ、360度で乗算
        // const targetRot: number = (this.mouseX / window.innerWidth) * 360;

        // イージングの公式を用いて滑らかにする
        // 値 += (目標値 - 現在の値) * 減速値
        // this.rot += (targetRot - this.rot) * 0.02;
        
        // ラジアンに変換する
        // const radian = (this.rot * Math.PI) / 180;

        // this.pointMesh.rotation.x = 100 * Math.sin(radian);
        // this.pointMesh.rotation.y = 100 * Math.sin(radian);

        const sec = performance.now() / 1000;
        this.uniforms.uTime.value = sec;
        // this.camera.position.x = 1000 * Math.sin(radian);
        // this.camera.position.y = 1000 * Math.cos(radian);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(()=> {this.tick()});
    }
}