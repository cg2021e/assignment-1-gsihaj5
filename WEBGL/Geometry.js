import Vector3 from './Vector3.js'
import Color from './Color.js'

export default class Geometry {
	_vertices = [] // Vector3
	_faces = []
	_normals = []

	//position :Vector3
	constructor (position = new Vector3(0, 0, 0), color = new Color(255, 0, 0), specular = 1) {
		this.position = position
		this.color = color
		this.specular = specular
	}

	calculateNormal () {
		this._calculateNormals(this.getVertices())
	}

	_calculateNormals (vertices) {
		for (let vertice_index = 0; vertice_index < vertices.length; vertice_index += 3) {
			let vertice1 = vertices[vertice_index]
			let vertice2 = vertices[vertice_index + 1]
			let vertice3 = vertices[vertice_index + 2]

			let vector1 = new Vector3(vertice2.x - vertice1.x, vertice2.y - vertice1.y, vertice2.z - vertice1.z)
			let vector2 = new Vector3(vertice3.x - vertice1.x, vertice3.y - vertice1.y, vertice3.z - vertice1.z)

			let normal = new Vector3(
				1000000 * ((vector2.y * vector1.z) - (vector2.z * vector1.y)),
				1000000 * ((vector2.z * vector1.x) - (vector2.x * vector1.z)),
				1000000 * ((vector2.x * vector1.y) - (vector2.y * vector1.x)),
			)
			this.addNormals(normal)
			this.addNormals(normal)
			this.addNormals(normal)
		}
	}

	//Vector3
	addVertice (vertice) {
		this._vertices.push(vertice)
	}

	addFace (face) {
		this._faces.push(face)
	}

	addNormals (normal) {
		this._normals.push(normal)
	}

	getColorArray () {
		let colors = []

		this._faces.forEach((faces) => {
			faces.getArray().forEach((index) => colors.push(...this.color.getArray()))
		})
		return colors
	}

	getVertices () {
		let vertices = []

		this._faces.forEach((faces) => {
			faces.getArray().forEach((index) => vertices.push(this._vertices[index]))
		})

		return vertices
	}

	getNormalArray () {
		let faceNormals = []

		this._normals.forEach(normal => faceNormals.push(...normal.getArray()))

		return faceNormals
	}

	getSpecular () {
		let specular = Array(this.getVerticeArray().length).fill(this.specular)
		return specular
	}

	getVerticeArray () {
		let vertices = []

		this._faces.forEach((faces) => {
			faces.getArray().forEach((index) => {
				let verticeArray = this._vertices[index].getArray()
				verticeArray[0] += this.position.x
				verticeArray[1] += this.position.y
				verticeArray[2] += this.position.z
				vertices.push(...verticeArray)
			})
		})

		return vertices
	}

	translate (x, y, z) {
		this.position.x += x
		this.position.y += y
		this.position.z += z
	}

}