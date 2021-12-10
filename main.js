import Scene from './WEBGL/Scene.js'
import Vector3 from './WEBGL/Vector3.js'
import EssentialOilBottle from './EssentialOilBottle.js'
import Color from './WEBGL/Color.js'
import Geometry from './WEBGL/Geometry.js'
import Face from './WEBGL/Face.js'

let canvas, scene
let bottle, bottle1

let speed = 10

let dragging, rotation = glMatrix.mat4.create()

let angle = 90
let distance = 3

let lastPointOnTrackBall, currentPointOnTrackBall
let lastQuat = glMatrix.quat.create()

function main () {
	canvas = document.querySelector('#glCanvas')
	scene = new Scene(canvas)
	scene.cameraPosition[0] = distance * Math.cos(angle * Math.PI / 180)
	scene.cameraPosition[2] = distance * Math.sin(angle * Math.PI / 180)

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

		let cameraSpeed = .05

		//UP
		if (event.keyCode === 38) {
			distance -= cameraSpeed
			scene.cameraPosition[0] = distance * Math.cos(angle * Math.PI / 180)
			scene.cameraPosition[2] = distance * Math.sin(angle * Math.PI / 180)
			scene.render(false)
		}

		//DOWN
		if (event.keyCode === 40) {
			distance += cameraSpeed
			scene.cameraPosition[0] = distance * Math.cos(angle * Math.PI / 180)
			scene.cameraPosition[2] = distance * Math.sin(angle * Math.PI / 180)
			scene.render(false)
		}

		//Left
		if (event.keyCode === 37) {
			angle += cameraSpeed * 100
			scene.cameraPosition[0] = distance * Math.cos(angle * Math.PI / 180)
			scene.cameraPosition[2] = distance * Math.sin(angle * Math.PI / 180)
			scene.render(false)
		}

		//Right
		if (event.keyCode === 39) {
			angle -= cameraSpeed * 100
			scene.cameraPosition[0] = distance * Math.cos(angle * Math.PI / 180)
			scene.cameraPosition[2] = distance * Math.sin(angle * Math.PI / 180)
			scene.render(false)

		}
	})

	document.addEventListener('mousedown', onMouseDown, false)
	document.addEventListener('mouseup', onMouseUp, false)
	document.addEventListener('mousemove', onMouseMove, false)
}

function computeCurrentQuat () {
	// Secara berkala hitung quaternion rotasi setiap ada perubahan posisi titik pointer mouse
	var axisFromCrossProduct = glMatrix.vec3.cross(glMatrix.vec3.create(), lastPointOnTrackBall, currentPointOnTrackBall)
	var angleFromDotProduct = Math.acos(glMatrix.vec3.dot(lastPointOnTrackBall, currentPointOnTrackBall))
	var rotationQuat = glMatrix.quat.setAxisAngle(glMatrix.quat.create(), axisFromCrossProduct, angleFromDotProduct)
	glMatrix.quat.normalize(rotationQuat, rotationQuat)
	return glMatrix.quat.multiply(glMatrix.quat.create(), rotationQuat, lastQuat)
}

function getProjectionPointOnSurface (point) {
	let radius = canvas.width / 3  // Jari-jari virtual trackball kita tentukan sebesar 1/3 lebar kanvas
	let center = glMatrix.vec3.fromValues(canvas.width / 2, canvas.height / 2, 0)  // Titik tengah virtual trackball
	let pointVector = glMatrix.vec3.subtract(glMatrix.vec3.create(), point, center)
	pointVector[1] = pointVector[1] * (-1) // Flip nilai y, karena koordinat piksel makin ke bawah makin besar
	let radius2 = radius * radius
	let length2 = pointVector[0] * pointVector[0] + pointVector[1] * pointVector[1]
	if (length2 <= radius2) pointVector[2] = Math.sqrt(radius2 - length2) // Dapatkan nilai z melalui rumus Pytagoras
	else {  // Atur nilai z sebagai 0, lalu x dan y sebagai paduan Pytagoras yang membentuk sisi miring sepanjang radius
		pointVector[0] *= radius / Math.sqrt(length2)
		pointVector[1] *= radius / Math.sqrt(length2)
		pointVector[2] = 0
	}
	return glMatrix.vec3.normalize(glMatrix.vec3.create(), pointVector)
}

function onMouseDown (event) {
	var x = event.clientX
	var y = event.clientY
	var rect = event.target.getBoundingClientRect()
	if (
		rect.left <= x &&
		rect.right >= x &&
		rect.top <= y &&
		rect.bottom >= y
	) {
		dragging = true
	}
	lastPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0))
	currentPointOnTrackBall = lastPointOnTrackBall
}

function onMouseUp (event) {
	dragging = false
	if (currentPointOnTrackBall !== lastPointOnTrackBall) {
		lastQuat = computeCurrentQuat()
	}
}

function onMouseMove (event) {
	if (dragging) {
		var x = event.clientX
		var y = event.clientY
		currentPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0))
		glMatrix.mat4.fromQuat(rotation, computeCurrentQuat())

		scene.rotation = rotation
		scene.render(false)
	}
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

	//atas
	cube.addFace(new Face(0, 2, 1))
	cube.addFace(new Face(1, 2, 3))

	//depan
	cube.addFace(new Face(0, 4, 2))
	cube.addFace(new Face(2, 4, 6))

	//bawah
	cube.addFace(new Face(4, 5, 6))
	cube.addFace(new Face(6, 5, 7))

	//kanan
	cube.addFace(new Face(0, 5, 1))
	cube.addFace(new Face(0, 4, 5))

	//kiri
	cube.addFace(new Face(2, 3, 7))
	cube.addFace(new Face(2, 7, 6))

	//belakang
	cube.addFace(new Face(1, 5, 3))
	cube.addFace(new Face(3, 7, 5))

	cube.calculateNormal()
	return cube
}

window.onload = () => {
	main()
}

