export default class Scene {
	geometries = []
	cameraPosition = [0, 0, 3]
	lightPosition = [0, 0, .7]
	lookAt = [0, 0, 0]

	constructor (domElement) {
		this.domElement = domElement
		this.context = domElement.getContext('webgl')

		if (this.context === null) {
			alert('Unable to initialize WebGL. Your browser or machine may not support it.')
			return
		}
		this._createShaderProgram()
		this.isShining = true
	}

	_createShaderProgram () {
		this.shaderProgram = this.context.createProgram()
		this.context.attachShader(this.shaderProgram, this._createVertexShader())
		this.context.attachShader(this.shaderProgram, this._createFragmentShader())
		this.context.linkProgram(this.shaderProgram)
		this.context.useProgram(this.shaderProgram)
	}

	_createVertexShader () {
		let vertexShaderCode = `
            attribute vec3 aCoordinates;
            attribute vec3 aColors;
            attribute vec3 aNormal;
            attribute float aShininessConstant;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uViewMatrix;
            varying vec4 vColor;
            varying vec3 vCoordinates;
            varying vec3 vNormal;
            varying float vShininessConstant;
            void main(){
                gl_Position =  uProjectionMatrix * uViewMatrix *  vec4(aCoordinates.x / 100.0, aCoordinates.y / 100.0, aCoordinates.z / 100.0, 1.0);
                vColor = vec4(aColors, 1);
                vNormal = aNormal;
                vCoordinates = vec3(aCoordinates.x / 100.0, aCoordinates.y / 100.0, aCoordinates.z / 100.0);
                vShininessConstant = aShininessConstant;
            }`

		let vertexShader = this.context.createShader(this.context.VERTEX_SHADER)
		this.context.shaderSource(vertexShader, vertexShaderCode)
		this.context.compileShader(vertexShader)

		let compiled = this.context.getShaderParameter(vertexShader, this.context.COMPILE_STATUS)
		if (!compiled) {
			console.error(this.context.getShaderInfoLog(vertexShader))
		}
		return vertexShader
	}

	_createFragmentShader () {
		let fragmentShaderCode = `
			precision mediump float;
            varying vec4 vColor;
            varying vec3 vCoordinates;
            varying vec3 vNormal;
            varying float vShininessConstant;
            uniform vec3 uLightConstant;
            uniform vec3 uLightPosition;
            uniform vec3 uCameraPosition;
            uniform float uAmbientIntensity;
            uniform bool uIsShining;
            
            void main(){
                vec3 ambient = uLightConstant * uAmbientIntensity;
                vec3 lightDirection = uLightPosition - vCoordinates;
                vec3 normalizedLight = normalize(lightDirection);
                vec3 normalizedNormal = normalize(vNormal);
                
                float cosTheta = dot(normalizedNormal, normalizedLight);
                vec3 diffuse = vec3(0,0,0);
                
                if(cosTheta > 0.){
                	float diffuseIntensity = cosTheta;
                	diffuse = uLightConstant * diffuseIntensity;
                }
                
                vec3 reflector = reflect(-lightDirection, normalizedNormal);
                vec3 normalizedReflector = normalize(reflector);
                vec3 normalizedViewer = normalize(uCameraPosition - vCoordinates);
                float cosPhi = dot(normalizedReflector, normalizedViewer);
                vec3 specular =  vec3(0.,0.,0.);
                
                if(cosPhi > 0.){
                	float specularIntensity = pow(cosPhi, vShininessConstant);
                	specular = uLightConstant * specularIntensity;
                }
                
                vec3 phong = ambient + diffuse + specular;
                
                if(uIsShining){
                	gl_FragColor = vec4(phong.x * vColor.x, phong.y * vColor.y, phong.z * vColor.z, vColor.w);
                } else {
                	gl_FragColor = vec4(ambient.x * vColor.x, ambient.y * vColor.y, ambient.z * vColor.z, vColor.w);
                
                }
                
            }`

		let fragmentShader = this.context.createShader(this.context.FRAGMENT_SHADER)
		this.context.shaderSource(fragmentShader, fragmentShaderCode)
		this.context.compileShader(fragmentShader)

		let compiled = this.context.getShaderParameter(fragmentShader, this.context.COMPILE_STATUS)
		if (!compiled) {
			console.error(this.context.getShaderInfoLog(fragmentShader))
		}
		return fragmentShader
	}

	_bindArrayInsideShader (arrayToBePushed, shaderAttribute) {
		let buffer = this.context.createBuffer()
		this.context.bindBuffer(this.context.ARRAY_BUFFER, buffer)
		this.context.bufferData(this.context.ARRAY_BUFFER, arrayToBePushed, this.context.STATIC_DRAW)

		let coordinate = this.context.getAttribLocation(this.shaderProgram, shaderAttribute)
		this.context.vertexAttribPointer(coordinate, 3, this.context.FLOAT, false, 0, 0)
		this.context.enableVertexAttribArray(coordinate)
	}

	_bindUniformArrayInsideShader (arrayToBePushed, shaderUniform) {
		let uniform = this.context.getUniformLocation(this.shaderProgram, shaderUniform)
		this.context.uniform3fv(uniform, arrayToBePushed)
	}

	_bindUniformDataInsideShader (valueTobePushed, shaderUniform) {
		let uniform = this.context.getUniformLocation(this.shaderProgram, shaderUniform)
		this.context.uniform1f(uniform, valueTobePushed)
	}

	add (geometry) {
		this.geometries.push(geometry)
	}

	remove (removedGeometry) {
		this.geometries.forEach((geometry, index, object) => {
			if (removedGeometry === geometry) object.splice(index, 1)
		})
	}

	render () {
		let vertices = []
		let colors = []
		let normals = []
		let speculars = []

		this.geometries.forEach((geometry) => {
			vertices.push(...geometry.getVerticeArray())
			colors.push(...geometry.getColorArray())
			normals.push(...geometry.getNormalArray())
			speculars.push(...geometry.getSpecular())
		})

		vertices = new Float32Array([...vertices])
		colors = new Float32Array([...colors])
		normals = new Float32Array([...normals])
		speculars = new Float32Array([...speculars])

		this.context.enable(this.context.DEPTH_TEST)
		this.context.depthFunc(this.context.LEQUAL)
		this.context.clearColor(1.0, 1.0, 1.0, 1.0)
		this.context.clearDepth(1.0)
		this.context.clear(this.context.COLOR_BUFFER_BIT)
		this.context.viewport(0, 0, this.domElement.width, this.domElement.height)

		this.context.enable(this.context.BLEND)
		this.context.blendFunc(
			this.context.ONE,
			this.context.ONE_MINUS_SRC_ALPHA
		)

		let projection_matrix = this.get_projection(30, this.domElement.width / this.domElement.height, 1, 100)
		let PMatrixPointer = this.context.getUniformLocation(this.shaderProgram, 'uProjectionMatrix')
		this.context.uniformMatrix4fv(PMatrixPointer, false, projection_matrix)

		let viewMatrix = glMatrix.mat4.create()
		glMatrix.mat4.lookAt(
			viewMatrix,
			this.cameraPosition,      // camera position
			this.lookAt,      // the point where camera looks at
			[0, 1, 0]       // up vector of the camera
		)

		let VMatrixPointer = this.context.getUniformLocation(this.shaderProgram, 'uViewMatrix')
		this.context.uniformMatrix4fv(VMatrixPointer, false, viewMatrix)

		this._bindArrayInsideShader(vertices, 'aCoordinates')
		this._bindArrayInsideShader(colors, 'aColors')
		this._bindArrayInsideShader(normals, 'aNormal')
		this._bindArrayInsideShader(speculars, 'aShininessConstant')
		this._bindUniformArrayInsideShader([1, 1, 1], 'uLightConstant')
		this._bindUniformArrayInsideShader(this.lightPosition, 'uLightPosition')
		this._bindUniformArrayInsideShader(this.cameraPosition, 'uCameraPosition')
		this._bindUniformDataInsideShader(.324, 'uAmbientIntensity')
		this._bindUniformDataInsideShader(this.isShining, 'uIsShining')
		console.log(this.lightPosition)
		console.log(vertices)
		console.log(colors)
		console.log(normals)
		console.log(speculars)

		this.context.drawArrays(this.context.TRIANGLES, 0, vertices.length / 3)
	}

	get_projection (angle, a, zMin, zMax) {
		let ang = Math.tan((angle * .5) * Math.PI / 180)//angle*.5
		return [
			0.5 / ang, 0, 0, 0,
			0, 0.5 * a / ang, 0, 0,
			0, 0, -(zMax + zMin) / (zMax - zMin), -1,
			0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
		]
	}

}