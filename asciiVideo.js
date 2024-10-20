document.addEventListener('DOMContentLoaded', () => {
	const toggleButton = document.getElementById('toggleButton');
	let isInverted = document.getElementById('invert');
	let iscolored = document.getElementById('colored');

	// Check localStorage for dark mode preference on page load
	// and
	// Set the input field to the default density string on page load
	const darkModePreference = localStorage.getItem('darkMode') === 'true';

	window.onload = function () {
		document.getElementById('densityString').value = defaultDensity;
		if (darkModePreference) {
			document.body.classList.add('dark-mode');
			isInverted.checked = true;
		} else {
			document.body.classList.remove('dark-mode');
		}
	};

	// reset density string
	document
		.getElementById('resetDensityString')
		.addEventListener('click', () => {
			document.getElementById('densityString').value = defaultDensity;
			density = defaultDensity;
		});

	// Toggle dark mode and save preference
	toggleButton.addEventListener('click', () => {
		document.body.classList.toggle('dark-mode');

		// Save the preference in localStorage
		const isDarkMode = document.body.classList.contains('dark-mode');
		localStorage.setItem('darkMode', isDarkMode);
		isInverted.checked = isDarkMode; // auto turn on inverted mode if dark mode is on
	});

	const defaultDensity = '@%#*+=-:. '; // Original density string
	let density = defaultDensity; // Initialize density with the default value

	// check for change in density string in the input box
	document
		.getElementById('densityString')
		.addEventListener('input', (event) => {
			density = event.target.value; // Update the global density variable
			console.log('Updated Density String:', density);
		});

	function normalize(x, min1, max1, min2, max2) {
		const range1 = max1 - min1;
		const range2 = max2 - min2;
		return ((x - min1) / range1) * range2 + min2;
	}

	const openCam = document.getElementById('openCam');
	const closeCam = document.getElementById('closeCam');
	const toggleCamera = document.getElementById('toggleCamera');

	const video = document.getElementById('vid');
	const canvas = document.getElementById('canvas');
	const context = canvas.getContext('2d');
	const mediaDevices = navigator.mediaDevices;

	video.muted = true;
	let currentStream;
	let isFrontCamera = true;

	function startCamera() {
		const constraints = {
			video: {
				facingMode: isFrontCamera ? 'user' : 'environment',
			},
			audio: false,
		};

		mediaDevices
			.getUserMedia(constraints)
			.then((stream) => {
				currentStream = stream;
				video.srcObject = stream;
				video.addEventListener('loadedmetadata', () => {
					video.play();
					initializeAscii();
					setInterval(ascii, 100);
				});
			})
			.catch((error) => {
				console.error('Error accessing webcam:', error);
			});
	}

	openCam.addEventListener('click', startCamera);

	closeCam.addEventListener('click', () => {
		if (currentStream) {
			currentStream.getTracks().forEach((track) => track.stop()); // Stop all tracks
			video.srcObject = null; // Reset the video element
			currentStream = null; // Clear the stream reference
		}
	});

	toggleCamera.addEventListener('click', () => {
		if (currentStream) {
			currentStream.getTracks().forEach((track) => track.stop()); // Stop the current stream
			video.srcObject = null; // Reset the video element
		}
		isFrontCamera = !isFrontCamera; // Toggle camera state
		startCamera(); // Restart the camera with the new setting
	});

	function initializeAscii() {
		canvas.width = window.innerWidth / 8;
		canvas.height = window.innerHeight / 8;
	}

	function ascii() {
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		let textBox = document.getElementById('textBox');
		let frameData = context.getImageData(0, 0, canvas.width, canvas.height);

		let allRows = ''; // Accumulate all rows as a string
		let len = density.length - 1;
		let start = 0;

		if (isInverted.checked) {
			start = len;
			len = 0;
		}

		for (let i = 0; i < canvas.height; i++) {
			let row = '';
			for (let j = canvas.width - 1; j >= 0; j--) {
				const pixelIndex = (i * canvas.width + j) * 4;
				const red = frameData.data[pixelIndex + 0];
				const green = frameData.data[pixelIndex + 1];
				const blue = frameData.data[pixelIndex + 2];

				const avg = (red + green + blue) / 3;
				const charIndex = Math.floor(
					normalize(avg, 0, 255, start, len)
				);
				const c = density.charAt(charIndex);

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
			allRows += `<div>${row}</div>`; // Add row to accumulated HTML
		}

		textBox.innerHTML = allRows; // Update the DOM once with the full content
	}
});
