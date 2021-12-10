import Scene from './WEBGL/Scene.js'
import Vector3 from './WEBGL/Vector3.js'
import EssentialOilBottle from './EssentialOilBottle.js'
import Color from './WEBGL/Color.js'
import Geometry from './WEBGL/Geometry.js'
import Face from './WEBGL/Face.js'

let canvas, scene
let bottle, bottle1

let speed = 10

function main () {
	canvas = document.querySelector('#glCanvas')
	scene = new Scene(canvas)

	bottle = new EssentialOilBottle(
		new Vector3(50, -50, 0),
		10,
		100,
		true
	)
	scene.add(bottle)

	bottle1 = new EssentialOilBottle(
		new Vector3(-50, -50, 0),
		150,
		100,
		true
	)

	scene.add(bottle1)
	scene.add(createLabel())

	let box = createBox()
	scene.add(box)

	scene.add(createPlane())
	scene.render()

	window.addEventListener('keydown', (event) => {
		console.log(event)
		if (event.keyCode === 32) {
			scene.isShining = !scene.isShining
			scene.render()
		}
		//W
		if (event.keyCode === 87) {
			box.position.z -= 10
			scene.lightPosition[2] -= 10 / 100
			scene.render()
		}
		//S
		if (event.keyCode === 83) {
			box.position.z += 10
			scene.lightPosition[2] += 10 / 100
			scene.render()
		}
		//A
		if (event.keyCode === 65) {
			box.position.x -= 10
			scene.lightPosition[0] -= 10 / 100
			scene.render()
		}
		//D
		if (event.keyCode === 68) {
			box.position.x += 10
			scene.lightPosition[0] += 10 / 100
			scene.render()
		}

		//UP
		if (event.keyCode === 38) {
			scene.cameraPosition[2] -= .5
			scene.lookAt[2] -= .5
			scene.render()
		}

		//DOWN
		if (event.keyCode === 40) {
			scene.cameraPosition[2] += .5
			scene.lookAt[2] += .5
			scene.render()
		}

		//Left
		if (event.keyCode === 37) {
			scene.cameraPosition[0] += .5
			scene.lookAt[0] += .5
			scene.render()
		}

		//Right
		if (event.keyCode === 39) {
			scene.cameraPosition[0] -= .5
			scene.lookAt[0] -= .5
			scene.render()
		}
	})

}

function createPlane () {
	let plane = new Geometry(new Vector3(0, 0, 0), new Color(18, 65, 36)) //this rgb representation of #124124

	let width = 20
	let height = 20
	let y = -60

	plane.addVertice(new Vector3(-width / 2, y, -height / 2)) //kiri bawah
	plane.addVertice(new Vector3(width / 2, y, -height / 2)) //kanan bawah
	plane.addVertice(new Vector3(-width / 2, y, height / 2)) //kiri atas
	plane.addVertice(new Vector3(width / 2, y, height / 2)) //kanan atas

	plane.addFace(new Face(0, 1, 3))
	plane.addFace(new Face(0, 3, 2))
	plane.calculateNormal()
	return plane
}

function createLabel () {
	let label = new Geometry(bottle1.position.clone(), new Color(60, 60, 60))

	let offsetX = -5
	let offsetY = 7
	let offsetZ = 40
	let width = 15
	let height = 20

	label.addVertice(new Vector3(offsetX + 3, offsetY + 1, offsetZ)) //krii bawh
	label.addVertice(new Vector3(offsetX + width + 3, offsetY, offsetZ)) // kanan bawah
	label.addVertice(new Vector3(offsetX, offsetY + height, offsetZ))// kiri atas
	label.addVertice(new Vector3(offsetX + width, offsetY + height, offsetZ)) //kanan atas

	label.addFace(new Face(0, 1, 3))
	label.addFace(new Face(0, 3, 2))

	label.calculateNormal()
	return label
}

function createBox () {
	let cube = new Geometry(new Vector3(0, 0, 0), new Color(255, 0, 0))
	let width = 15
	let height = 15
	let depth = 15

	//atas
	cube.addVertice(new Vector3(width / 2, height / 2, depth / 2))//depan kanan
	cube.addVertice(new Vector3(width / 2, height / 2, -depth / 2))//belakang kanan
	cube.addVertice(new Vector3(-width / 2, height / 2, depth / 2))//depan kiri
	cube.addVertice(new Vector3(-width / 2, height / 2, -depth / 2))//belakang kiri

	//bawah
	cube.addVertice(new Vector3(width / 2, -height / 2, depth / 2))//depan kanan
	cube.addVertice(new Vector3(width / 2, -height / 2, -depth / 2))//belakang kanan
	cube.addVertice(new Vector3(-width / 2, -height / 2, depth / 2))//depan kiri
	cube.addVertice(new Vector3(-width / 2, -height / 2, -depth / 2))//belakang kiri

	//bawah
	cube.addFace(new Face(0, 2, 1))
	cube.addFace(new Face(2, 3, 0))

	//depan
	cube.addFace(new Face(0, 4, 2))
	cube.addFace(new Face(2, 4, 6))
	//atas
	cube.addFace(new Face(4, 5, 6))
	cube.addFace(new Face(6, 5, 7))

	cube.calculateNormal()
	return cube
}

window.onload = () => {
	main()
}

