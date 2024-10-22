function openApp(app) {
    const apps = document.querySelectorAll('.app');
    apps.forEach(app => app.style.display = 'none');
    
    const appElement = document.getElementById(app);
    if (appElement) {
        appElement.style.display = 'flex';
    }
}

function showHome() {
    openApp('home');
}

function showMessages() {
    openApp('message');
}

function showSettings() {
    openApp('settings');
}

function openMusicPlayer() {
    document.querySelector('.modal-overlay').style.display = 'block';
    document.querySelector('.player-modal').style.display = 'flex';
}

function closeMusicPlayer() {
    document.querySelector('.modal-overlay').style.display = 'none';
    document.querySelector('.player-modal').style.display = 'none';
}

let audioContext;
let analyser;
let dataArray;
let bufferLength;
let audioElement = new Audio(); // Inicializa o elemento de áudio
let currentIndex = 0;
let audioFiles = [];
let repeatAll = false;
let repeatOne = false;
let shuffle = false;

function loadAudioFiles() {
    const files = document.getElementById('audioFiles').files;
    audioFiles = Array.from(files);
    if (audioFiles.length > 0) {
        loadAudio(audioFiles[currentIndex]);
    } else {
        alert("Por favor, selecione arquivos de áudio válidos.");
    }
}

function loadAudio(file) {
    const audioURL = URL.createObjectURL(file);
    audioElement.src = audioURL;
    audioElement.play();

    // Atualiza informações do áudio
    document.getElementById('trackTitle').textContent = `Título da Música: ${file.name}`;
    document.getElementById('artistName').textContent = 'Artista: Desconhecido';
    document.getElementById('albumName').textContent = 'Álbum: Desconhecido';

    // Inicializa o Spectrum
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        startSpectrum();
    }

    // Atualiza a duração total do áudio
    audioElement.onloadedmetadata = () => {
        document.getElementById('totalTime').textContent = `Duração Total: ${formatTime(audioElement.duration)}`;
    };

    // Atualiza o tempo atual do áudio
    audioElement.ontimeupdate = () => {
        document.getElementById('currentTime').textContent = `Tempo Atual: ${formatTime(audioElement.currentTime)}`;
    };

    // Reproduz a próxima música ao finalizar a atual
    audioElement.onended = () => {
        if (repeatOne) {
            loadAudio(audioFiles[currentIndex]);
        } else if (shuffle) {
            currentIndex = Math.floor(Math.random() * audioFiles.length);
            loadAudio(audioFiles[currentIndex]);
        } else if (repeatAll) {
            currentIndex = (currentIndex + 1) % audioFiles.length;
            loadAudio(audioFiles[currentIndex]);
        } else {
            if (currentIndex < audioFiles.length - 1) {
                currentIndex++;
                loadAudio(audioFiles[currentIndex]);
            }
        }
    };
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function playAudio() {
    audioElement.play();
}

function pauseAudio() {
    audioElement.pause();
}

function stopAudio() {
    audioElement.pause();
    audioElement.currentTime = 0;
}

function nextAudio() {
    if (shuffle) {
        currentIndex = Math.floor(Math.random() * audioFiles.length);
    } else {
        currentIndex = (currentIndex + 1) % audioFiles.length;
    }
    loadAudio(audioFiles[currentIndex]);
}

function previousAudio() {
    if (shuffle) {
        currentIndex = Math.floor(Math.random() * audioFiles.length);
    } else {
        currentIndex = (currentIndex - 1 + audioFiles.length) % audioFiles.length;
    }
    loadAudio(audioFiles[currentIndex]);
}

function toggleRepeat() {
    if (!repeatAll && !repeatOne) {
        repeatAll = true;
        repeatOne = false;
        document.getElementById('repeatButton').innerHTML = '<i class="fas fa-redo"></i> Repetir Tudo';
    } else if (repeatAll && !repeatOne) {
        repeatAll = false;
        repeatOne = true;
        document.getElementById('repeatButton').innerHTML = '<i class="fas fa-redo"></i> Repetir Um';
    } else {
        repeatAll = false;
        repeatOne = false;
        document.getElementById('repeatButton').innerHTML = '<i class="fas fa-redo"></i> Repetir';
    }
}

function toggleShuffle() {
    shuffle = !shuffle;
    const shuffleButton = document.getElementById('shuffleButton');
    shuffleButton.style.color = shuffle ? '#ff1b6b' : '#fff';
}

function setVolume() {
    const volume = document.getElementById('volumeControl').value;
    audioElement.volume = volume;
}

function startSpectrum() {
    const spectrum = document.getElementById('spectrum');
    spectrum.innerHTML = '';
    for (let i = 0; i < bufferLength; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        spectrum.appendChild(bar);
    }

    function animateSpectrum() {
        requestAnimationFrame(animateSpectrum);
        analyser.getByteFrequencyData(dataArray);

        const bars = spectrum.children;
        for (let i = 0; i < bars.length; i++) {
            bars[i].style.height = `${dataArray[i] / 2}px`;
            bars[i].style.transition = 'height 0.1s'; // Mantém a parte inferior estática
        }
    }
    animateSpectrum();
}
