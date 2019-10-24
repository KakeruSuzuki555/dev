import * as Three from 'three';
import { BufferAttribute, Uint16Attribute } from 'three';

export interface Circle {
    vertices: Array<number>;            // 頂点
    circleIndices: Array<number>;       // 文字(正方形)のインデックス
    randomValues: Array<number>;        // 頂点計算等に使用するランダム値
    uvs: Array<number>;                 // UV座標
    indices: Array<number>;             // インデックス
    circleHeight: number;
    circleHalfWidth: number;
    circleHarfHeight: number;
    numCircle: number;
    geometry: Three.BufferGeometry;
}

export class CircleGeometry implements Circle {

    /** attributes用の配列を生成 */
    vertices: Array<number> = new Array<number>();              // 頂点
    circleIndices: Array<number> = new Array<number>();         // 文字(正方形)のインデックス
    randomValues: Array<number> = new Array<number>();          // 頂点計算等に使用するランダム値
    uvs: Array<number> = new Array<number>();                   // UV座標
    indices: Array<number> = new Array<number>();               // インデックス

    circleHeight: number = 0;
    circleHalfWidth: number = 0;
    circleHarfHeight: number = 0;

    numCircle: number = 0;
    geometry: Three.BufferGeometry = new Three.BufferGeometry();
    constructor(circleWidth: number, numCircle: number) {
        this.circleHeight = circleWidth;
        this.circleHalfWidth = this.circleHeight/2;
        this.circleHarfHeight = this.circleHeight/2;
        this.numCircle = numCircle;
        this.init();
    }

    init ():void {
        // this.numCircleの数だけ正方形を生成
        for (let i = 0; i < this.numCircle; i ++) {
            // GLSLで使用するランダムな値
            let randomValue: Array<number> = [
                Math.random(),
                Math.random(),
                Math.random()
            ];

            /** 頂点データ作成 */ 

            // 左上
            this.vertices.push(-this.circleHalfWidth); // x
            this.vertices.push(this.circleHarfHeight); // y
            this.vertices.push(0);                     // z

            this.uvs.push(0); // u
            this.uvs.push(0); // v

            this.circleIndices.push(i); // 何番目かを表すインデックス番号

            this.randomValues.push(randomValue[0]) // GLSLで使用するランダムな値 (vec3になるので3つ)
            this.randomValues.push(randomValue[1]) // GLSLで使用するランダムな値 (vec3になるので3つ)
            this.randomValues.push(randomValue[2]) // GLSLで使用するランダムな値 (vec3になるので3つ)

            // 右上
            this.vertices.push(this.circleHalfWidth);
            this.vertices.push(this.circleHarfHeight);
            this.vertices.push(0);

            this.uvs.push(1);
            this.uvs.push(0);

            this.circleIndices.push(i);

            this.randomValues.push(randomValue[0]);
            this.randomValues.push(randomValue[1]);
            this.randomValues.push(randomValue[2]);

            // 左下
            this.vertices.push(-this.circleHalfWidth);
            this.vertices.push(-this.circleHarfHeight);
            this.vertices.push(0);

            this.uvs.push(0);
            this.uvs.push(1);

            this.circleIndices.push(i);

            this.randomValues.push(randomValue[0]);
            this.randomValues.push(randomValue[1]);
            this.randomValues.push(randomValue[2]);

            // 右下
            this.vertices.push(this.circleHalfWidth);
            this.vertices.push(-this.circleHarfHeight);
            this.vertices.push(0);

            this.uvs.push(1);
            this.uvs.push(1);

            this.circleIndices.push(i);

            this.randomValues.push(randomValue[0]);
            this.randomValues.push(randomValue[1]);
            this.randomValues.push(randomValue[2]);

            // ポリゴンを生成するインデックスをpush (三角形ポリゴンが2枚なので6個)
            let indexOffset: number = i * 4;
            this.indices.push(indexOffset + 0);
            this.indices.push(indexOffset + 2);
            this.indices.push(indexOffset + 1);
            this.indices.push(indexOffset + 2);
            this.indices.push(indexOffset + 3);
            this.indices.push(indexOffset + 1);
        }
        
        this.geometry.addAttribute('position', new Three.BufferAttribute(new Float32Array(this.vertices), 3));
        this.geometry.addAttribute('randomValues', new Three.BufferAttribute(new Float32Array(this.randomValues), 3));
        this.geometry.addAttribute('circleIndex', new Three.BufferAttribute(new Uint16Array(this.circleIndices), 1));
        this.geometry.addAttribute('uv', new Three.BufferAttribute(new Float32Array(this.uvs), 2));
        this.geometry.setIndex(new BufferAttribute(new Uint16Array(this.indices), 1));
        this.geometry.computeVertexNormals();
    }
}