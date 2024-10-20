const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
let originalImage = null; // Store the original image

let isInverted = document.getElementById('invert');
let iscolored = document.getElementById('colored');

let textBox = document.getElementById('textBox');

const toggleButton = document.getElementById('toggleButton');

// Original density string
const defaultDensity1 =
	'$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const defaultDensity2 = '@%#*+=-:. '; // Original density string
let density1 = defaultDensity1; // Initialize density with the default value
let density2 = defaultDensity2; // Initialize density with the default value

// Check localStorage for dark mode preference on page load
window.onload = function () {
	document.getElementById('densityString1').value = defaultDensity1;
	document.getElementById('densityString2').value = defaultDensity2;

	const darkModePreference = localStorage.getItem('darkMode') === 'true';
	if (darkModePreference) {
		document.body.classList.add('dark-mode');
		isInverted.checked = true;
	} else {
		document.body.classList.remove('dark-mode');
	}
};

document.getElementById('resetDensityString').addEventListener('click', () => {
	document.getElementById('densityString1').value = defaultDensity1;
	document.getElementById('densityString2').value = defaultDensity2;
});

// for density 1
document.getElementById('densityString1').addEventListener('input', (event) => {
	density1 = event.target.value; // Update the global density variable
	console.log('Updated Density String:', density1);
});

// for density 2
document.getElementById('densityString2').addEventListener('input', (event) => {
	density2 = event.target.value; // Update the global density variable
	console.log('Updated Density String:', density2);
});

// Toggle dark mode and save preference
toggleButton.addEventListener('click', () => {
	document.body.classList.toggle('dark-mode');

	// Save the preference in localStorage
	const isDarkMode = document.body.classList.contains('dark-mode');
	localStorage.setItem('darkMode', isDarkMode);
	isInverted.checked = isDarkMode; // auto turn on inverted mode if dark mode is on
});

/**
 * Normalize a value from one range to another range.
 *
 * @param {number} x - value to normalize
 * @param {number} min1 - minimum value of the original range
 * @param {number} max1 - maximum value of the original range
 * @param {number} min2 - minimum value of the target range
 * @param {number} max2 - maximum value of the target range
 * @return {number} normalized value
 */
function normalize(x, min1, max1, min2, max2) {
	return ((x - min1) / (max1 - min1)) * (max2 - min2) + min2;
}

/**
 * Reset the image back to the original and then upload a new image.
 * If a file is selected, it is read and the original image is stored.
 * The original image is then resized and drawn onto the canvas.
 * If no file is selected, an alert is shown.
 */
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

//slider for pixelation controls

var pixelationLevel = document.getElementById('pixelationLevel');
var pixelationSlider = document.getElementById('pixelateRange');
// Triggered when the user changes the value of the pixelation slider.
// Updates the value displayed next to the slider and applies the pixelation effect.
pixelationSlider.oninput = function () {
	pixelationLevel.innerHTML = this.value;
	applyPixelate();
};

// Apply pixelation effect
function applyPixelate() {
	if (originalImage) {
		const pixelationLevel = pixelationSlider.value; // Adjust this value for more or less pixelation

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

// sizing controls

/**
 * Resize the original image to the specified dimensions and draw it on the canvas.
 *
 * This function uses a temporary canvas to resize the original image.
 * It then clears the main canvas, sets the image smoothing option to true,
 * and draws the resized image on the main canvas.
 *
 * @param {number} newWidth - the new width to resize to
 * @param {number} newHeight - the new height to resize to
 */
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
/**
 * Resets the image to its original canvas size (250x250), clears the canvas and redraws the original image.
 * If the original image does not exist, this function does nothing.
 */
function smallImage() {
	if (originalImage) {
		canvas.width = 250;
		canvas.height = 250;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
		ctx.filter = 'none'; // Remove any filters
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

//ascii converters

/**
 * Takes the current image on the canvas and converts it to an ASCII art
 * representation, which is then displayed in the text box.
 *
 * The ASCII representation is generated by iterating through each pixel of the
 * image, calculating the average color value of the pixel, and using that value
 * to index into the `density1` string. The corresponding character is then added
 * to a string representing the current row of the image.
 *
 * The `density1` string is a string of characters where the first character
 * represents the darkest color and the last character represents the lightest
 * color. The characters in between represent the various shades of gray.
 *
 * If the `invert` checkbox is checked, the string is reversed so that the
 * lightest color is first and the darkest color is last.
 *
 * When the row is complete, it is added to the text box as a `div` element.
 */

function toASCII1() {
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	let allRows = '';
	let len = density1.length - 1;

	let start = 0;
	if (isInverted.checked) {
		start = len;
		len = 0;
	}

	for (let i = 0; i < canvas.height; i++) {
		let row = '';
		for (let j = 0; j < canvas.width; j++) {
			const pixelIndex = (i * canvas.width + j) * 4;
			const red = imgData.data[pixelIndex + 0];
			const green = imgData.data[pixelIndex + 1];
			const blue = imgData.data[pixelIndex + 2];

			const avg = (red + green + blue) / 3;

			const charIndex = Math.floor(normalize(avg, 0, 255, start, len));
			const c = density1.charAt(charIndex);
			if (c === ' ') {
				row += '&nbsp;';
			} else {
				if (iscolored.checked) {
					row += `<span style="color: rgb(${red}, ${green}, ${blue})">${c}</span>`;
				} else {
					row += c;
				}
			}
		}
		allRows += `<div>${row}</div>`;
	}
	textBox.innerHTML = allRows;
}
/**
 * Takes the current image on the canvas and converts it to an ASCII art
 * representation, which is then displayed in the text box.
 *
 * The ASCII representation is generated by iterating through each pixel of the
 * image, calculating the average color value of the pixel, and using that value
 * to index into the `density2` string. The corresponding character is then added
 * to a string representing the current row of the image.
 *
 * The `density2` string is a string of characters where the first character
 * represents the darkest color and the last character represents the lightest
 * color. The characters in between represent the various shades of gray.
 *
 * If the `invert` checkbox is checked, the string is reversed so that the
 * lightest color is first and the darkest color is last.
 *
 * When the row is complete, it is added to the text box as a `div` element.
 */
function toASCII2() {
	let textBox = document.getElementById('textBox');
	let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	let allRows = '';

	let len = density2.length - 1;
	let start = 0;
	if (isInverted.checked) {
		start = len;
		len = 0;
	}

	for (let i = 0; i < canvas.height; i++) {
		let row = '';
		for (let j = 0; j < canvas.width; j++) {
			const pixelIndex = (i * canvas.width + j) * 4;
			const red = imgData.data[pixelIndex + 0];
			const green = imgData.data[pixelIndex + 1];
			const blue = imgData.data[pixelIndex + 2];

			const avg = (red + green + blue) / 3;

			const charIndex = Math.floor(normalize(avg, 0, 255, start, len));
			const c = density2.charAt(charIndex);
			if (c === ' ') {
				row += '&nbsp;';
			} else {
				if (iscolored.checked) {
					row += `<span style="color: rgb(${red}, ${green}, ${blue})">${c}</span>`;
				} else {
					row += c;
				}
			}
		}
		allRows += `<div>${row}</div>`;
	}
	textBox.innerHTML = allRows;
}

// size down slider controls
var sizeDownLevel = document.getElementById('sizeDownLevel');
var sizeDownslider = document.getElementById('sizeDownRange');

// Update the sizeDownLevel element to show the current value of the sizeDownRange slider when the user is interacting with the slider.
sizeDownslider.oninput = function () {
	sizeDownLevel.innerHTML = this.value;
};

//sized down image conversions

function toASCII3() {
	let textBox = document.getElementById('textBox');
	textBox.innerHTML = '';
	if (originalImage) {
		const pixelationLevel = sizeDownslider.value; // Adjust this value for more or less pixelation

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

		let allRows = '';

		let len = density1.length - 1;

		let start = 0;
		if (isInverted.checked) {
			start = len;
			len = 0;
		}

		for (let i = 0; i < tempCanvas.height; i++) {
			let row = '';
			for (let j = 0; j < tempCanvas.width; j++) {
				const pixelIndex = (i * tempCanvas.width + j) * 4;
				const red = imgData.data[pixelIndex + 0];
				const green = imgData.data[pixelIndex + 1];
				const blue = imgData.data[pixelIndex + 2];
				const alpha = imgData.data[pixelIndex + 3];

				const avg = (red + green + blue) / 3;

				const charIndex = Math.floor(
					normalize(avg, 0, 255, start, len)
				);
				const c = density1.charAt(charIndex);
				if (c === ' ') {
					row += '&nbsp;';
				} else {
					if (iscolored.checked) {
						row += `<span style="color: rgb(${red}, ${green}, ${blue})">${c}</span>`;
					} else {
						row += c;
					}
				}
			}
			allRows += `<div>${row}</div>`;
		}
		textBox.innerHTML = allRows;
	}
}
function toASCII4() {
	let textBox = document.getElementById('textBox');
	textBox.innerHTML = '';
	if (originalImage) {
		const pixelationLevel = sizeDownslider.value; // Adjust this value for more or less pixelation

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

		let allRows = '';

		let len = density2.length - 1;

		let start = 0;
		if (isInverted.checked) {
			start = len;
			len = 0;
		}

		for (let i = 0; i < tempCanvas.height; i++) {
			let row = '';
			for (let j = 0; j < tempCanvas.width; j++) {
				const pixelIndex = (i * tempCanvas.width + j) * 4;
				const red = imgData.data[pixelIndex + 0];
				const green = imgData.data[pixelIndex + 1];
				const blue = imgData.data[pixelIndex + 2];
				const alpha = imgData.data[pixelIndex + 3];

				const avg = (red + green + blue) / 3;

				const charIndex = Math.floor(
					normalize(avg, 0, 255, start, len)
				);
				const c = density2.charAt(charIndex);
				if (c === ' ') {
					row += '&nbsp;';
				} else {
					if (iscolored.checked) {
						row += `<span style="color: rgb(${red}, ${green}, ${blue})">${c}</span>`;
					} else {
						row += c;
					}
				}
			}
			allRows += `<div>${row}</div>`;
		}
		textBox.innerHTML = allRows;
	}
}

//downloading the image and text

// Download the modified image
function downloadImage() {
	const link = document.createElement('a');
	link.download = 'modified-image.png';
	link.href = canvas.toDataURL('image/png');
	link.click();
}

/**
 * Downloads the current ASCII art representation in the text box
 * as a .txt file.
 *
 * The downloaded file will have the name "ascii-art.txt".
 *
 * @function downloadASCII
 */
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
