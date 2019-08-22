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
    // private boxGeometry: THREE.BoxGeometry;
    private sphereGeometry: THREE.SphereGeometry;
    private material: THREE.MeshNormalMaterial;
    private box: THREE.Mesh;

    /** 平行光源 */
    private directionalLight: THREE.DirectionalLight;

    private rot: number = 0;

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

        // this.boxGeometry = new THREE.BoxGeometry(400, 400, 400);
        this.sphereGeometry = new THREE.SphereGeometry(300, 30, 30);
        // this.material = new THREE.MeshNormalMaterial();
        this.material = new THREE.MeshStandardMaterial({color:0xFF0000});
        this.box = new THREE.Mesh(this.sphereGeometry, this.material);

        this.scene.add(this.box);
        this.createStarField();
        this.directionalLight = new THREE.DirectionalLight(0xFFFFFF);
        this.directionalLight.position.set(1, 1, 1);

        this.scene.add(this.directionalLight);
        this.tick();
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

        const mesh = new THREE.Points(geometry, material);
        this.scene.add(mesh);
    }

    tick () {
        this.rot += 0.5;

        const radian = (this.rot * Math.PI) / 180;
        // this.box.rotation.y += 0.01;
        this.camera.position.x = 1000 * Math.sin(radian);
        this.camera.position.y = 1000 * Math.cos(radian);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.tick.bind(this));
    }
}