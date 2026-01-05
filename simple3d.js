class Object3D {
    #verticies;
    #faces;

    constructor(data) {
        this.#verticies = [];
        this.#faces = [];

        const tokens = data.split("\n").map((a) => a.split(" ")).flat();
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] == "v" && i + 3 < tokens.length) {
                this.#verticies.push({
                    x: parseFloat(tokens[i + 1]),
                    y: parseFloat(tokens[i + 2]),
                    z: parseFloat(tokens[i + 3])
                });
            }
        }

        console.log(this.#verticies);
        
        // Load verticies

        // Object vertex data
/*        this.#verticies = [
            {x: 0.25, y: 0.25, z: 0.25},
            {x: -0.25, y: 0.25, z: 0.25},
            {x: -0.25, y: -0.25, z: 0.25},
            {x: 0.25, y: -0.25, z: 0.25},

            {x: 0.25, y: 0.25, z: -0.25},
            {x: -0.25, y: 0.25, z: -0.25},
            {x: -0.25, y: -0.25, z: -0.25},
            {x: 0.25, y: -0.25, z: -0.25},
        ];

        // Object face data
        this.#faces = [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7]
        ];

        console.log(data);*/
    }

    getVerticies() {
        return this.#verticies;
    }

    getFaces() {
        return this.#faces;
    }
}

class Canvas {
    // Frames per second
    static FPS = 60;
    // Default colors
    static BACKGROUND = "#000000";
    static FOREGROUND = "#00ff00";

    #canvas;
    #context;

    constructor() {
        // Setup the canvas
        this.#canvas = document.getElementById("canvas");
        this.#canvas.width = 800;
        this.#canvas.height = 800;

        // Get a 2D context to draw onto the canvas
        this.#context = this.#canvas.getContext("2d");
    }

    clear(color) {
        // Set the draw color
        this.#context.fillStyle = color;

        // Draw a rectangle that fills the screen to mimic a clear
        this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawPoint({x, y}, color) {
        // Set the draw color
        this.#context.fillStyle = color; 

        // Draw the point
        this.#context.fillRect(x, y, 10, 10);
    }

    drawLine(v1, v2, color) {
        // Set the line properties and then draw the line
        this.#context.lineWidth = 5;
        this.#context.strokeStyle = color;

        // Draw the line
        this.#context.beginPath();
        this.#context.moveTo(v1.x, v1.y);
        this.#context.lineTo(v2.x, v2.y);
        this.#context.stroke();
    }
}

class Simple3D {
    #canvas;
    #showVerticies;
    #showFaces;
    #spinSpeed;
    #object;
    #deltaZ;
    #angle;

    constructor() {
        // Setup the canvas
        this.#canvas = new Canvas();

        // Add event listeners
        const showVerticies = document.getElementById("showVerticies");
        showVerticies.addEventListener("change", () => {
            this.#showVerticies = showVerticies.checked;
        });
        this.#showVerticies = showVerticies.checked;
        const showFaces = document.getElementById("showFaces");
        showFaces.addEventListener("change", () => {
            this.#showFaces = showFaces.checked;
        });
        this.#showFaces = showFaces.checked;
        const spinSpeed = document.getElementById("spinSpeed");
        spinSpeed.addEventListener("input", () => {
            this.#spinSpeed = spinSpeed.value;
        });
        this.#spinSpeed = spinSpeed.value;
        const objInput = document.getElementById("objInput");
        objInput.addEventListener("change", () => {
            const objFile = objInput.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.#object = new Object3D(reader.result);
            };
            reader.readAsText(objFile);
        });

        // Load the object
        this.#object = new Object3D("");

        // Object view properties
        this.#deltaZ = 1;
        this.#angle = 0;
    }
   
    render() {
        // Time between frames
        const deltaTime = 1 / Canvas.FPS;

        // Update the angle
        this.#angle += this.#spinSpeed * Math.PI * deltaTime;

        // Clear the canvas
        this.#canvas.clear(Canvas.BACKGROUND);
        
        // Draw the verticies
        if (this.#showVerticies) {
            for (const v of this.#object.getVerticies()) {
                // Convert the 3D coordinates to screen coordinates and draw the point to the screen
                this.#canvas.drawPoint(this.#calculatePoint(v, this.#angle, this.#deltaZ), Canvas.FOREGROUND);
            }
        }

        // Draw the faces
        if (this.#showFaces) {
            for (const f of this.#object.getFaces()) {
                for (let i = 0; i < f.length; i++) {
                    // Figure out the 2 verticies to connect
                    const v1 = this.#object.getVerticies()[f[i]];
                    const v2 = this.#object.getVerticies()[f[(i + 1) % f.length]];
        
                    // Draw the line
                    this.#canvas.drawLine(
                        this.#calculatePoint(v1, this.#angle, this.#deltaZ), 
                        this.#calculatePoint(v2, this.#angle, this.#deltaZ), 
                        Canvas.FOREGROUND
                    );
                }
            }
        }

        // Wait for some time based on the FPS then redraw
        setTimeout(() => { this.render() }, 1000 / Canvas.FPS);
    }

    #calculatePoint(v, angle, dz) {
        // Convert the 3D coordinates to screen coordinates
        const vRot = this.#rotateXZ(v, angle);
        const vTZ = this.#translateZ(vRot, dz);
        const v2D = this.#to2DCoords(vTZ);
        const result = this.#toScreenCoords(v2D);

        // Return the result
        return result;
    }

    #toScreenCoords(v) {
        // Convert normalised coordinates to screen coordinates
        return {
            x: (v.x + 1) / 2 * canvas.width,
            y: (1 - (v.y + 1) / 2) * canvas.height
        };
    }

    #to2DCoords({x, y, z}) {
        // Convert normalised 3D coordinates to normalised 2D coordinates
        return {
            x: x / z,
            y: y / z
        };
    }

    #translateZ({x, y, z}, dz) {
        // Offset the Z by the delta of Z
        return {
            x: x,
            y: y,
            z: z + dz
        };
    }

    #rotateXZ({x, y, z}, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: (x * cos) - (z * sin),
            y: y,
            z: (x * sin) + (z * cos)
        };
    }

    #rotateYZ({x, y, z}, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x,
            y: (y * cos) - (z * sin),
            z: (y * sin) + (z * cos)
        };
    }

    #rotateXY({x, y, z}, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: (x * cos) - (y * sin),
            y: (x * sin) + (y * cos),
            z: z
        };
    }

    #getCheckbox(name) {
        return document.querySelector(`#${name}:checked`) !== null;
    }

    #getSlider(name) {
        document.querySelector(`#${name}:range`);
        return;
    }
}

// Start the renderer
const s3d = new Simple3D();
s3d.render();
