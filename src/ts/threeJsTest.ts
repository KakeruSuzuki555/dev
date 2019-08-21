import * as THREE from 'three';

export class ThreeJsTest {

    private wrap: HTMLElement;
    private canvas: HTMLCanvasElement;
    
    /** レンダラー作成 */
    private renderer: THREE.WebGLRenderer;

    /** シーン作成(3D空間) */
    private scene: THREE.Scene;

    /** カメラ作成 */
    private camera: THREE.PerspectiveCamera;

    /** 箱を作成 */
    private geometry: THREE.BoxGeometry;
    private material: THREE.MeshNormalMaterial;
    private box: THREE.Mesh;

    constructor(){

        this.wrap = <HTMLElement>document.getElementById('wrapper');

        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');

        this.canvas.width = this.wrap.offsetWidth;
        this.canvas.height = this.wrap.offsetHeight;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.wrap.offsetWidth, this.wrap.offsetHeight);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, this.wrap.offsetWidth / this.wrap.offsetHeight);
        this.camera.position.set(0, 0, +1000);

        this.geometry = new THREE.BoxGeometry(400, 400, 400);
        this.material = new THREE.MeshNormalMaterial();
        this.box = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.box);
        this.tick();
    }

    tick () {
        this.box.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.tick.bind(this));
    }
}