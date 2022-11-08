const maximumAttempts = 15; // Numero de errores maximos
const columns = 4; // Numero de columnas que tendra el memorama
const secondsToShowImage = 1; // Cuantos segundos se mostrara la imagen
const questionImage = "./img/question.png"; // Imagen que se muestra antes de turnCard la imagen
let randomOne = Math.floor(Math.random() * ((4 + 1) - 1) + 1);
let randomTwo = Math.floor(Math.random() * ((8 + 1) - 5) + 5);
let randomThree = Math.floor(Math.random() * ((12 + 1) - 9) + 9);
let randomFour = Math.floor(Math.random() * ((16 + 1) - 13) + 13);
let randomFive = Math.floor(Math.random() * ((20 + 1) - 17) + 17);
let randomSix = Math.floor(Math.random() * ((24 + 1) - 21) + 21);
let randomSeven = Math.floor(Math.random() * ((28 + 1) - 25) + 25);
let randomEight = Math.floor(Math.random() * ((32 + 1) - 29) + 29);
console.log(randomOne, randomTwo, randomThree, randomFour, randomFive, randomSix, randomSeven, randomEight);

new Vue({
    el: "#app",
    data: () => ({
        // Imagenes a mostrar
        images: [
            `./img/${randomOne}.png`,
            `./img/${randomTwo}.png`,
            `./img/${randomThree}.png`,
            `./img/${randomFour}.png`,
            `./img/${randomFive}.png`,
            `./img/${randomSix}.png`,
            `./img/${randomSeven}.png`,
            `./img/${randomEight}.png`,
        ],
        memorama: [],
        lastCoordinates: {
            rowIndex: null,
            imageIndex: null,
        },
        questionImage: questionImage,
        maximumAttempts: maximumAttempts,
        attempts: 0,
        hits: 0,
        timeout: false,
    }),
    methods: {
        endGame() {
            Swal.fire({
                title: "Perdiste",
                html: `
                <img class="img-fluid" src="./img/perdiste.jpg" alt="Perdiste">
                <p class="h4">Agotaste tus intentos</p>`,
                confirmButtonText: "Jugar de nuevo",
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
                .then(this.restartGame)
        },
        // Mostrar alerta de victoria y reiniciar juego
        alertWinner() {
            Swal.fire({
                title: "¡Ganaste!",
                html: `
                <img class="img-fluid" src="./img/ganaste.webp" alt="Ganaste">
                <p class="h4">Muy bien hecho</p>`,
                confirmButtonText: "Jugar de nuevo",
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
                .then(this.restartGame)
        },
        // Método que indica si el jugador ha ganado
        isWinner() {
            return this.memorama.every(arreglo => arreglo.every(imagen => imagen.acertada));
        },
        // Ayudante para mezclar un arreglo
        showRamdomArray(a) {
            var j, x, i;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = a[i];
                a[i] = a[j];
                a[j] = x;
            }
            return a;
        },
        // Aumenta un intento y verifica si el jugador ha perdido
        addAttempt() {
            this.attempts++;
            if (this.attempts >= maximumAttempts) {
                this.endGame();
            }
        },
        // Se desencadena cuando se hace click en la imagen
        turnCard(rowIndex, imageIndex) {
            // Si se está regresando una imagen a su estado original, detener flujo
            if (this.timeout) {
                return;
            }
            // Si es una imagen acertada, no nos importa que la intenten turnCard
            if (this.memorama[rowIndex][imageIndex].acertada) {
                return;
            }
            // Si es la primera vez que la selecciona
            if (this.lastCoordinates.rowIndex === null && this.lastCoordinates.imageIndex === null) {
                this.memorama[rowIndex][imageIndex].mostrar = true;
                this.lastCoordinates.rowIndex = rowIndex;
                this.lastCoordinates.imageIndex = imageIndex;
                return;
            }
            // Si es el que estaba mostrada, lo ocultamos de nuevo
            let imagenSeleccionada = this.memorama[rowIndex][imageIndex];
            let ultimaImagenSeleccionada = this.memorama[this.lastCoordinates.rowIndex][this.lastCoordinates.imageIndex];
            if (rowIndex === this.lastCoordinates.rowIndex &&
                imageIndex === this.lastCoordinates.imageIndex) {
                this.memorama[rowIndex][imageIndex].mostrar = false;
                this.lastCoordinates.rowIndex = null;
                this.lastCoordinates.imageIndex = null;
                this.addAttempt();
                return;
            }

            // En caso de que la haya encontrado, ¡acierta!
            // Se basta en ultimaImagenSeleccionada
            this.memorama[rowIndex][imageIndex].mostrar = true;
            if (imagenSeleccionada.ruta === ultimaImagenSeleccionada.ruta) {
                this.hits++;
                this.memorama[rowIndex][imageIndex].acertada = true;
                this.memorama[this.lastCoordinates.rowIndex][this.lastCoordinates.imageIndex].acertada = true;
                this.lastCoordinates.rowIndex = null;
                this.lastCoordinates.imageIndex = null;
                // Cada que acierta comprobamos si ha ganado
                if (this.isWinner()) {
                    this.alertWinner();
                }
            } else {
                // Si no acierta, entonces giramos ambas imágenes
                this.timeout = true;
                setTimeout(() => {
                    this.memorama[rowIndex][imageIndex].mostrar = false;
                    this.memorama[rowIndex][imageIndex].animacion = false;
                    this.memorama[this.lastCoordinates.rowIndex][this.lastCoordinates.imageIndex].mostrar = false;
                    this.lastCoordinates.rowIndex = null;
                    this.lastCoordinates.imageIndex = null;
                    this.timeout = false;
                }, secondsToShowImage * 1000);
                this.addAttempt();
            }
        },
        restartGame() {
            let memorama = [];
            this.images.forEach((imagen, indice) => {
                let imagenDememorama = {
                    ruta: imagen,
                    mostrar: false, // No se muestra la original
                    acertada: false, // No es acertada al inicio
                };
                // Poner dos veces la misma imagen
                memorama.push(imagenDememorama, Object.assign({}, imagenDememorama));
            });

            // Sacudir o mover arreglo; es decir, hacerlo aleatorio
            this.showRamdomArray(memorama);

            // Dividirlo en subarreglos o columns
            let memoramaDividido = [];
            for (let i = 0; i < memorama.length; i += columns) {
                memoramaDividido.push(memorama.slice(i, i + columns));
            }
            // Reiniciar attempts
            this.attempts = 0;
            this.hits = 0;
            // Asignar a instancia de Vue para que lo dibuje
            this.memorama = memoramaDividido;
        },
        // Método que precarga las imágenes para que las mismas ya estén cargadas
        // cuando el usuario gire la tarjeta
        loadingImage() {
            // Mostrar la alerta
            Swal.fire({
                title: "Cargando",
                html: `Cargando imágenes...`,
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
                .then(this.restartGame)
            // Ponerla en modo carga
            Swal.showLoading();


            let total = this.images.length,
                contador = 0;
            let imagesPrecarga = Array.from(this.images);
            // También vamos a precargar la "espalda" de la tarjeta
            imagesPrecarga.push(questionImage);
            // Cargamos cada imagen y en el evento load aumentamos el contador
            imagesPrecarga.forEach(ruta => {
                const imagen = document.createElement("img");
                imagen.src = ruta;
                imagen.addEventListener("load", () => {
                    contador++;
                    if (contador >= total) {
                        // Si el contador >= total entonces se ha terminado la carga de todas
                        this.restartGame();
                        Swal.close();
                    }
                });
                // Agregamos la imagen y la removemos instantáneamente, así no se muestra
                // pero sí se carga
                document.body.appendChild(imagen);
                document.body.removeChild(imagen);
            });
        },
    },
    mounted() {
        this.loadingImage();
    },
});