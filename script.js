const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
let originalImage = null; // Store the original image
const density1 =
	'$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const density2 = '@%#*+=-:. ';

let isInverted = document.getElementById('invert');

const toggleButton = document.getElementById('toggleButton');

toggleButton.addEventListener('click', () => {
	document.body.classList.toggle('dark-mode');
});

function normalize(x, min1, max1, min2, max2) {
	return ((x - min1) / (max1 - min1)) * (max2 - min2) + min2;
}

function uploadImage() {
	resetImage();
	const input = document.getElementById('imageInput');
	const file = input.files[0];

	if (file) {
		const reader = new FileReader();

		reader.onload = function (event) {
			img.onload = function () {
				// Store original image
				originalImage = img;
				canvas.width = img.width / 4;
				canvas.height = img.height / 4;
				// Clear the canvas and draw the original image
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			};
			img.src = event.target.result;
		};

		reader.readAsDataURL(file);
	} else {
		alert('Please upload an image.');
	}
}

function resize(newWidth = img.width, newHeight = img.height) {
	if (originalImage) {
		// Create a temporary canvas for resizing
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');

		// Set the temporary canvas size to the new dimensions
		tempCanvas.width = newWidth;
		tempCanvas.height = newHeight;

		// Draw the original image onto the temporary canvas at the new size
		tempCtx.drawImage(originalImage, 0, 0, newWidth, newHeight);

		// Clear the main canvas before drawing the resized image
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Set image smoothing options
		ctx.imageSmoothingEnabled = true; // Enable for smooth resizing
		canvas.height = newHeight;
		canvas.width = newWidth;
		ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight); // Draw the resized image on the main canvas
	}
}

// Apply grayscale filter
function applyGrayscale() {
	ctx.filter = 'grayscale(100%)';
	ctx.drawImage(canvas, 0, 0);
}

// Apply blur filter
function applyBlur() {
	ctx.filter = 'blur(5px)';
	ctx.drawImage(canvas, 0, 0);
}
var output = document.getElementById('pixelationLevel');
var slider = document.getElementById('pixelateRange');
slider.oninput = function () {
	output.innerHTML = this.value;
	applyPixelate();
};
// Apply pixelation effect
function applyPixelate() {
	if (originalImage) {
		const pixelationLevel = slider.value; // Adjust this value for more or less pixelation

		// Create a temporary canvas for pixelation
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');

		// Set temporary canvas size to the size of the pixelation effect
		tempCanvas.width = canvas.width / pixelationLevel;
		tempCanvas.height = canvas.height / pixelationLevel;

		// Draw the original image at a reduced size
		tempCtx.drawImage(
			originalImage,
			0,
			0,
			tempCanvas.width,
			tempCanvas.height
		);

		// Draw the small canvas back onto the main canvas, scaled up
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.imageSmoothingEnabled = false; // Disable smoothing for pixelation effect
		ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
	}
}

// Reset the image back to the original
function resetImage() {
	if (originalImage) {
		canvas.width = img.width / 4;
		canvas.height = img.height / 4;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
		ctx.filter = 'none'; // Remove any filters
	}
}
function smallImage() {
	if (originalImage) {
		canvas.width = 250;
		canvas.height = 250;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
		ctx.filter = 'none'; // Remove any filters
	}
}

function toASCII1() {
	let textBox = document.getElementById('textBox');
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	textBox.innerHTML = '';
	for (let i = 0; i < canvas.height; i++) {
		let row = '';
		for (let j = 0; j < canvas.width; j++) {
			const pixelIndex = (i * canvas.width + j) * 4;
			const red = imgData.data[pixelIndex + 0];
			const green = imgData.data[pixelIndex + 1];
			const blue = imgData.data[pixelIndex + 2];
			const alpha = imgData.data[pixelIndex + 3];

			const avg = (red + green + blue) / 3;

			let len = density1.length - 1;

			let start = 0;
			if (isInverted.checked) {
				start = len;
				len = 0;
			}
			const charIndex = Math.floor(normalize(avg, 0, 255, start, len));
			const c = density1.charAt(charIndex);
			if (c === ' ') {
				row += '&nbsp;';
			} else {
				row += c;
			}
		}
		const rowElement = document.createElement('div');
		rowElement.textContent = row;
		textBox.appendChild(rowElement);
	}
}
function toASCII2() {
	let textBox = document.getElementById('textBox');
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	textBox.innerHTML = '';
	for (let i = 0; i < canvas.height; i++) {
		let row = '';
		for (let j = 0; j < canvas.width; j++) {
			const pixelIndex = (i * canvas.width + j) * 4;
			const red = imgData.data[pixelIndex + 0];
			const green = imgData.data[pixelIndex + 1];
			const blue = imgData.data[pixelIndex + 2];
			const alpha = imgData.data[pixelIndex + 3];

			const avg = (red + green + blue) / 3;

			let len = density2.length - 1;

			let start = 0;
			if (isInverted.checked) {
				start = len;
				len = 0;
			}
			const charIndex = Math.floor(normalize(avg, 0, 255, start, len));
			const c = density2.charAt(charIndex);
			if (c == ' ') {
				row += '&nbsp; ';
			} else {
				row += c;
			}
		}
		const rowElement = document.createElement('div');
		rowElement.textContent = row;
		textBox.appendChild(rowElement);
	}
}

function toASCII3() {
	let textBox = document.getElementById('textBox');
	textBox.innerHTML = '';
	if (originalImage) {
		const pixelationLevel = 8; // Adjust this value for more or less pixelation

		// Create a temporary canvas for pixelation
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');

		// Set temporary canvas size to the size of the pixelation effect
		tempCanvas.width = img.width / pixelationLevel;
		tempCanvas.height = img.height / pixelationLevel;

		// Draw the original image at a reduced size
		tempCtx.drawImage(
			originalImage,
			0,
			0,
			tempCanvas.width,
			tempCanvas.height
		);
		let imgData = tempCtx.getImageData(
			0,
			0,
			tempCanvas.width,
			tempCanvas.height
		);
		for (let i = 0; i < tempCanvas.height; i++) {
			let row = '';
			for (let j = 0; j < tempCanvas.width; j++) {
				const pixelIndex = (i * tempCanvas.width + j) * 4;
				const red = imgData.data[pixelIndex + 0];
				const green = imgData.data[pixelIndex + 1];
				const blue = imgData.data[pixelIndex + 2];
				const alpha = imgData.data[pixelIndex + 3];

				const avg = (red + green + blue) / 3;

				let len = density1.length - 1;

				let start = 0;
				if (isInverted.checked) {
					start = len;
					len = 0;
				}
				const charIndex = Math.floor(
					normalize(avg, 0, 255, start, len)
				);
				const c = density1.charAt(charIndex);
				if (c == ' ') {
					row += '&nbsp;';
				} else {
					row += c;
				}
			}
			const rowElement = document.createElement('div');
			rowElement.textContent = row;
			textBox.appendChild(rowElement);
		}
	}
}
function toASCII4() {
	let textBox = document.getElementById('textBox');
	textBox.innerHTML = '';
	if (originalImage) {
		const pixelationLevel = 8; // Adjust this value for more or less pixelation

		// Create a temporary canvas for pixelation
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');

		// Set temporary canvas size to the size of the pixelation effect
		tempCanvas.width = img.width / pixelationLevel;
		tempCanvas.height = img.height / pixelationLevel;

		// Draw the original image at a reduced size
		tempCtx.drawImage(
			originalImage,
			0,
			0,
			tempCanvas.width,
			tempCanvas.height
		);
		let imgData = tempCtx.getImageData(
			0,
			0,
			tempCanvas.width,
			tempCanvas.height
		);
		for (let i = 0; i < tempCanvas.height; i++) {
			let row = '';
			for (let j = 0; j < tempCanvas.width; j++) {
				const pixelIndex = (i * tempCanvas.width + j) * 4;
				const red = imgData.data[pixelIndex + 0];
				const green = imgData.data[pixelIndex + 1];
				const blue = imgData.data[pixelIndex + 2];
				const alpha = imgData.data[pixelIndex + 3];

				const avg = (red + green + blue) / 3;

				let len = density2.length - 1;

				let start = 0;
				if (isInverted.checked) {
					start = len;
					len = 0;
				}
				const charIndex = Math.floor(
					normalize(avg, 0, 255, start, len)
				);
				const c = density2.charAt(charIndex);
				if (c == ' ') {
					row += '&nbsp;';
				} else {
					row += c;
				}
			}
			const rowElement = document.createElement('div');
			rowElement.textContent = row;
			textBox.appendChild(rowElement);
		}
	}
}
// Download the modified image
function downloadImage() {
	const link = document.createElement('a');
	link.download = 'modified-image.png';
	link.href = canvas.toDataURL('image/png');
	link.click();
}

function downloadASCII() {
	let textBox = document.getElementById('textBox');
	let asciiContent = textBox.innerHTML
		.replace(/&nbsp;/g, ' ') // Replace non-breaking spaces with regular spaces
		.replace(/<div>/g, '') // Remove <div> tags
		.replace(/<\/div>/g, '\n'); // Replace closing </div> tags with new lines

	// Create a blob from the ASCII content
	const blob = new Blob([asciiContent], { type: 'text/plain' });
	const link = document.createElement('a');
	link.download = 'ascii-art.txt';

	// Create a link to the blob and trigger the download
	link.href = window.URL.createObjectURL(blob);
	link.click();
}
