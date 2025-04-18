﻿// --- Elementos DOM ---
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d'); const scoreElement = document.getElementById('score'); const phaseDisplayElement = document.getElementById('phase-display'); const mainMenuScreen = document.getElementById('main-menu'); const customizationScreen = document.getElementById('customization-screen'); const gameContainerScreen = document.getElementById('game-container'); const startGameButton = document.getElementById('start-game-button'); const customizeButton = document.getElementById('customize-button'); const highestPhaseInfo = document.getElementById('highest-phase-info');
const playerCustomizationOptionsContainer = document.getElementById('player-customization-options'); const followerCustomizationOptionsContainer = document.getElementById('follower-customization-options'); const backToMenuButton = document.getElementById('back-to-menu-button');
const completionOverlay = document.getElementById('completion-overlay'); const completionPhaseElement = document.getElementById('completion-phase'); const completionResultElement = document.getElementById('completion-result'); const starElements = [ document.getElementById('star1'), document.getElementById('star2'), document.getElementById('star3') ]; const starCountTextElement = document.getElementById('star-count-text');
const retrySvgButton = document.getElementById('retry-svg-button'); const nextPhaseSvgButton = document.getElementById('next-phase-svg-button'); const backToMenuCompleteButton = document.getElementById('back-to-menu-complete-button');
const gameOverOverlay = document.getElementById('game-over-overlay');
const retryGameOverButton = document.getElementById('retry-game-over-button');
const backToMenuGameOverButton = document.getElementById('back-to-menu-game-over-button');
const unlockNotificationElement = document.getElementById('unlock-notification'); const unlockImageElement = document.getElementById('unlock-image'); const unlockTextElement = document.getElementById('unlock-text');
let notificationTimeout = null;

// --- Configurações ---
const INITIAL_DUCKLING_COUNT = 10; const DUCKLING_COUNT_INCREMENT = 2; const PLAYER_SPEED = 0.08; const FOLLOWER_SPEED = 0.12; const RECRUIT_RADIUS = 50; const FOLLOW_DISTANCE = 40; const ANIMATION_SPEED = 15; const BOBBING_AMOUNT = 1.5; const FLIP_THRESHOLD = 0.1; const BACKGROUND_MUSIC_VOLUME = 0.15; const BASE_EVIL_SPAWN_CHANCE = 0.05; const EVIL_CHANCE_INCREMENT = 0.04; const MAX_EVIL_SPAWN_CHANCE = 0.5; const EVIL_ATTACK_RADIUS = 35; const EVIL_ATTACK_COOLDOWN = 180; const CLICK_REMOVE_RADIUS = 25; const THREE_STAR_THRESHOLD = 90; const TWO_STAR_THRESHOLD = 60; const ONE_STAR_THRESHOLD = 30; const UI_HOVER_VOLUME = 0.25; const UI_CLICK_VOLUME = 0.9; const GAME_CLICK_VOLUME = 0.8; const NOTIFICATION_DURATION = 4000;
const MAX_RAPID_LOSSES = 4; // ALTERADO - Limite aumentado para 4
const RAPID_LOSS_TIMEFRAME_MS = 5000; // Janela de tempo em milissegundos (5 segundos)
let canvasWidth = window.innerWidth; let canvasHeight = window.innerHeight; canvas.width = canvasWidth; canvas.height = canvasHeight; ctx.imageSmoothingEnabled = false;

// --- Recursos ---
const evilDuckImgs = []; let imagesLoaded = 0; const totalImages = 2; evilDuckImgs[0] = new Image(); evilDuckImgs[1] = new Image(); evilDuckImgs[0].onload = imageLoaded; evilDuckImgs[1].onload = imageLoaded; const evilDrawWidth = 32; const evilDrawHeight = 32; evilDuckImgs[0].src = './svg/evil-duckling-frame1.svg'; evilDuckImgs[1].src = './svg/evil-duckling-frame2.svg'; const starFilledPath = './star-full.png'; const starEmptyPath = './star-empty.png';
const customizations = [ { id: 'default', name: 'Normal', unlockPhasePlayer: 1, playerFrames: ['./svg/player-duck-frame1.svg', './svg/player-duck-frame2.svg'], followerFrames: ['./svg/follower-duckling-frame1.svg', './svg/follower-duckling-frame2.svg'] }, { id: 'tophat', name: 'Cartola', unlockPhasePlayer: 5, playerFrames: ['./svg/player-duck-tophat-frame1.svg', './svg/player-duck-tophat-frame2.svg'], followerFrames: ['./svg/follower-duckling-tophat-frame1.svg', './svg/follower-duckling-tophat-frame2.svg'] }, { id: 'sombrero', name: 'Sombrero', unlockPhasePlayer: 10, playerFrames: ['./svg/player-duck-sombrero-frame1.svg', './svg/player-duck-sombrero-frame2.svg'], followerFrames: ['./svg/follower-duckling-sombrero-frame1.svg', './svg/follower-duckling-sombrero-frame2.svg'] }, { id: 'strawhat', name: 'Palha', unlockPhasePlayer: 15, playerFrames: ['./svg/player-duck-strawhat-frame1.svg', './svg/player-duck-strawhat-frame2.svg'], followerFrames: ['./svg/follower-duckling-strawhat-frame1.svg', './svg/follower-duckling-strawhat-frame2.svg'] }, { id: 'viking', name: 'Viking', unlockPhasePlayer: 20, playerFrames: ['./svg/player-duck-viking-frame1.svg', './svg/player-duck-viking-frame2.svg'], followerFrames: ['./svg/follower-duckling-viking-frame1.svg', './svg/follower-duckling-viking-frame2.svg'] }, { id: 'sunglasses', name: 'Óculos', unlockPhasePlayer: 25, playerFrames: ['./svg/player-duck-sunglasses-frame1.svg', './svg/player-duck-sunglasses-frame2.svg'], followerFrames: ['./svg/follower-duckling-sunglasses-frame1.svg', './svg/follower-duckling-sunglasses-frame2.svg'] }, { id: 'bowtie', name: 'Gravata', unlockPhasePlayer: 30, playerFrames: ['./svg/player-duck-bowtie-frame1.svg', './svg/player-duck-bowtie-frame2.svg'], followerFrames: ['./svg/follower-duckling-bowtie-frame1.svg', './svg/follower-duckling-bowtie-frame2.svg'] }, { id: 'crown', name: 'Coroa', unlockPhasePlayer: 35, playerFrames: ['./svg/player-duck-crown-frame1.svg', './svg/player-duck-crown-frame2.svg'], followerFrames: ['./svg/follower-duckling-crown-frame1.svg', './svg/follower-duckling-crown-frame2.svg'] } ];
let playerImages = [new Image(), new Image()]; let followerImagesMap = {}; const playerDrawWidth = 48; const playerDrawHeight = 48; const followerDrawWidth = 32; const followerDrawHeight = 32;

// --- Áudio ---
let audioCtx; let generalGain; let uiClickSoundBuffer = null; let hoverSoundBuffer = null; let gameClickSoundBuffer = null; let recruitSoundBuffer = null; let backgroundMusicBuffer = null; let dieSoundBuffer = null; let completeSoundBuffer = null; let gameOverSoundBuffer = null; // NOVO: Buffer para som de game over
let backgroundMusicSource = null; let backgroundMusicGain = null;
const uiClickSoundPath = './click.mp3'; const hoverSoundPath = './button.mp3'; const gameClickSoundPath = './quack.mp3'; const recruitSoundPath = './duck.mp3'; const backgroundMusicPath = './music.wav'; const dieSoundPath = './die.mp3'; const completeSoundPath = './complete.mp3';
const gameOverSoundPath = './game_over.mp3'; // NOVO: Caminho para o som de game over

// Funções de Áudio
function loadSoundToBuffer(url, targetBufferSetter) { if (!audioCtx) { console.warn("AudioContext não inicializado..."); return Promise.reject("AudioContext not ready"); } console.log(`Tentando carregar som: ${url}`); return fetch(url).then(response => { if (!response.ok) { throw new Error(`Erro HTTP ${response.status} ao buscar ${url}`); } return response.arrayBuffer(); }).then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer)).then(decodedData => { console.log(`Som ${url} carregado.`); targetBufferSetter(decodedData); }).catch(error => { console.error(`Erro ao carregar/decodificar som de ${url}:`, error); const errorDiv = document.getElementById(`audio-error-${url.split('/').pop()}`) || document.createElement('div'); errorDiv.id = `audio-error-${url.split('/').pop()}`; errorDiv.textContent = `Erro: Falha ao carregar ${url}. Som indisponível.`; errorDiv.style.cssText = `position:absolute; bottom:${document.querySelectorAll('[id^=audio-error]').length * 40 + 10}px; left:10px; background:red; color:white; padding:10px; z-index:20; border-radius: 5px;`; if (!document.getElementById(errorDiv.id)) document.body.appendChild(errorDiv); throw error; }); }
function playBackgroundMusic() { if (!audioCtx || !backgroundMusicBuffer || !generalGain || backgroundMusicSource) return; if (audioCtx.state === 'suspended') { console.warn("AudioContext suspenso, música não iniciará."); return; } console.log("Iniciando música de fundo..."); backgroundMusicSource = audioCtx.createBufferSource(); backgroundMusicSource.buffer = backgroundMusicBuffer; backgroundMusicSource.loop = true; backgroundMusicGain = audioCtx.createGain(); backgroundMusicGain.gain.setValueAtTime(BACKGROUND_MUSIC_VOLUME, audioCtx.currentTime); backgroundMusicSource.connect(backgroundMusicGain).connect(generalGain); backgroundMusicSource.start(0); backgroundMusicSource.onended = () => { backgroundMusicSource = null; }; }
function stopBackgroundMusic() { if (backgroundMusicSource) { console.log("Parando música."); backgroundMusicSource.stop(0); backgroundMusicSource.disconnect(); backgroundMusicSource = null; backgroundMusicGain = null; } }
function setupAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); generalGain = audioCtx.createGain(); generalGain.gain.setValueAtTime(0.5, audioCtx.currentTime); generalGain.connect(audioCtx.destination); loadSoundToBuffer(uiClickSoundPath, buffer => { uiClickSoundBuffer = buffer; }); loadSoundToBuffer(hoverSoundPath, buffer => { hoverSoundBuffer = buffer; }); loadSoundToBuffer(gameClickSoundPath, buffer => { gameClickSoundBuffer = buffer; }); loadSoundToBuffer(recruitSoundPath, buffer => { recruitSoundBuffer = buffer; }); loadSoundToBuffer(dieSoundPath, buffer => { dieSoundBuffer = buffer; }); loadSoundToBuffer(completeSoundPath, buffer => { completeSoundBuffer = buffer; }); loadSoundToBuffer(gameOverSoundPath, buffer => { gameOverSoundBuffer = buffer; }); // NOVO: Carrega som de game over
 loadSoundToBuffer(backgroundMusicPath, buffer => { backgroundMusicBuffer = buffer; }); } catch (e) { console.warn("Web Audio API não suportada.", e); audioCtx = null; } } }
window.addEventListener('load', setupAudio);
function resumeAudioContext() { if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume().then(() => { console.log("AudioContext resumido."); if (!uiClickSoundBuffer) loadSoundToBuffer(uiClickSoundPath, buffer => { uiClickSoundBuffer = buffer; }); if (!hoverSoundBuffer) loadSoundToBuffer(hoverSoundPath, buffer => { hoverSoundBuffer = buffer; }); if (!gameClickSoundBuffer) loadSoundToBuffer(gameClickSoundPath, buffer => { gameClickSoundBuffer = buffer; }); if (!recruitSoundBuffer) loadSoundToBuffer(recruitSoundPath, buffer => { recruitSoundBuffer = buffer; }); if (!dieSoundBuffer) loadSoundToBuffer(dieSoundPath, buffer => { dieSoundBuffer = buffer; }); if (!completeSoundBuffer) loadSoundToBuffer(completeSoundPath, buffer => { completeSoundBuffer = buffer; }); if (!gameOverSoundBuffer) loadSoundToBuffer(gameOverSoundPath, buffer => { gameOverSoundBuffer = buffer; }); // NOVO: Garante que o som de GO seja carregado ao resumir
 if (!backgroundMusicBuffer) { loadSoundToBuffer(backgroundMusicPath, buffer => { backgroundMusicBuffer = buffer; }); } }).catch(e => console.error("Erro ao resumir AudioContext:", e)); } if (!audioCtx) { setupAudio(); } }
document.body.addEventListener('click', resumeAudioContext, { once: true }); document.body.addEventListener('mousemove', resumeAudioContext, { once: true });
function playLoadedSound(buffer, volume = 1.0) { if (!audioCtx || !buffer || !generalGain) return; if (audioCtx.state === 'suspended') { resumeAudioContext(); return; } const source = audioCtx.createBufferSource(); source.buffer = buffer; const soundGain = audioCtx.createGain(); soundGain.gain.setValueAtTime(volume, audioCtx.currentTime); source.connect(soundGain).connect(generalGain); source.start(0); }
function playEvilDefeatSound() { if (!audioCtx || !generalGain) return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3); gain.gain.setValueAtTime(0.5, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3); osc.connect(gain).connect(generalGain); osc.start(); osc.stop(audioCtx.currentTime + 0.3); }

// --- Estado do Jogo e Persistência ---
let player = { facingDirection: 'right', images: [new Image(), new Image()] }; let wildDucklings = []; let score = 0; let globalTick = 0; let gameComplete = false; let starsEarned = 0; let currentPhase = 1; let initialGoodDucklings = 0; let highestPhaseReached = 1; let phaseStars = {}; let selectedPlayerCustomizationId = 'default'; let selectedFollowerCustomizationId = 'default';
let recentLossTimestamps = []; // Array para rastrear timestamps de perdas

// --- Funções de Save/Load (sem alterações) ---
function loadGameData() { highestPhaseReached = parseInt(localStorage.getItem('duckHighestPhase') || '1', 10); phaseStars = JSON.parse(localStorage.getItem('duckPhaseStars') || '{}'); selectedPlayerCustomizationId = localStorage.getItem('duckPlayerCustomization') || 'default'; selectedFollowerCustomizationId = localStorage.getItem('duckFollowerCustomization') || 'default'; console.log("Dados carregados:", { highestPhaseReached, phaseStars, selectedPlayerCustomizationId, selectedFollowerCustomizationId }); highestPhaseInfo.textContent = highestPhaseReached; }
function saveGameData() { localStorage.setItem('duckHighestPhase', highestPhaseReached.toString()); localStorage.setItem('duckPhaseStars', JSON.stringify(phaseStars)); localStorage.setItem('duckPlayerCustomization', selectedPlayerCustomizationId); localStorage.setItem('duckFollowerCustomization', selectedFollowerCustomizationId); console.log("Dados salvos."); highestPhaseInfo.textContent = highestPhaseReached; }

// --- Gerenciamento de Telas (sem alterações) ---
const screens = document.querySelectorAll('.screen');
function showScreen(screenId) {
    console.log("Mostrando tela:", screenId);
    screens.forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.add('visible');
            screen.classList.remove('hidden');
             if (screenId === 'game-container') { canvas.classList.add('hide-cursor'); } else { canvas.classList.remove('hide-cursor'); }
        } else {
            screen.classList.remove('visible');
            setTimeout(() => {
                if (!screen.classList.contains('visible')) {
                    screen.classList.add('hidden');
                }
            }, 300);
             if (screen.id === 'game-container') { canvas.classList.remove('hide-cursor'); }
        }
    });

    // Esconder overlays específicos ao mudar de tela
    completionOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    if (screenId === 'main-menu' || screenId === 'customization-screen') {
        stopBackgroundMusic();
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            gameComplete = true; // Marca como completo para parar processos
            console.log("Game loop stopped due to screen change.");
        }
    }
}

// --- Funções Auxiliares (sem alterações) ---
function imageLoaded() { imagesLoaded++; if (imagesLoaded === totalImages) { console.log("Imagens base (maus) carregadas."); } else { console.log(`Imagem ${imagesLoaded}/${totalImages} carregada.`); } }
function getRandomPosition() { const margin = 50; return { x: margin + Math.random() * (canvasWidth - margin * 2), y: margin + Math.random() * (canvasHeight - margin * 2) }; }
function distance(obj1, obj2) { const dx = obj1.x - obj2.x; const dy = obj1.y - obj2.y; return Math.sqrt(dx * dx + dy * dy); }
function lerp(start, end, amount) { return start + (end - start) * amount; }
function resetDuckState(duck, isPlayer = false, isEvil = false) { const pos = isPlayer ? { x: canvasWidth / 2, y: canvasHeight / 2 } : getRandomPosition(); duck.x = pos.x; duck.y = pos.y; duck.prevX = pos.x; duck.prevY = pos.y; duck.targetX = pos.x; duck.targetY = pos.y; duck.isEvil = isEvil; duck.images = [new Image(), new Image()]; if (isPlayer) { const customization = customizations.find(c => c.id === selectedPlayerCustomizationId) || customizations[0]; duck.images[0].src = customization.playerFrames[0]; duck.images[1].src = customization.playerFrames[1]; duck.drawWidth = playerDrawWidth; duck.drawHeight = playerDrawHeight; duck.followers = []; } else if (isEvil) { duck.images[0].src = './svg/evil-duckling-frame1.svg'; duck.images[1].src = './svg/evil-duckling-frame2.svg'; duck.drawWidth = evilDrawWidth; duck.drawHeight = evilDrawHeight; duck.attackCooldown = 0; duck.isFollowing = false; } else { const customization = customizations.find(c => c.id === selectedFollowerCustomizationId) || customizations[0]; duck.images[0].src = customization.followerFrames[0]; duck.images[1].src = customization.followerFrames[1]; duck.drawWidth = followerDrawWidth; duck.drawHeight = followerDrawHeight; duck.isFollowing = false; } duck.animationFrame = 0; duck.animationTick = Math.floor(Math.random() * ANIMATION_SPEED); duck.isMoving = false; duck.bobbingOffset = 0; duck.facingDirection = 'right'; return duck; }

// --- Inicialização do Jogo/Fase (sem alterações) ---
function initGame() {
    console.log(`Iniciando Fase ${currentPhase}`);
    gameComplete = false; starsEarned = 0; initialGoodDucklings = 0; score = 0;
    recentLossTimestamps = []; // Reseta o rastreador de perdas
    completionOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden'); // Esconde overlay de game over
    player = resetDuckState(player, true, false); wildDucklings = [];
    updateScoreDisplay(); phaseDisplayElement.textContent = `Fase: ${currentPhase}`; globalTick = 0;
    const currentDucklingCount = INITIAL_DUCKLING_COUNT + (currentPhase - 1) * DUCKLING_COUNT_INCREMENT;
    const currentEvilChance = Math.min(MAX_EVIL_SPAWN_CHANCE, BASE_EVIL_SPAWN_CHANCE + (currentPhase - 1) * EVIL_CHANCE_INCREMENT);
    for (let i = 0; i < currentDucklingCount; i++) { const isEvil = Math.random() < currentEvilChance; wildDucklings.push(resetDuckState({}, false, isEvil)); if (!isEvil) { initialGoodDucklings++; } }
    score = 0; updateScoreDisplay(); console.log(`Patos Bons Iniciais: ${initialGoodDucklings}`);
    if (!audioCtx) { setupAudio(); } else { resumeAudioContext(); stopBackgroundMusic(); playBackgroundMusic(); }
    if (animationFrameId) cancelAnimationFrame(animationFrameId); canvas.classList.add('hide-cursor'); gameLoop();
}

// --- Lógica do Jogo ---
function updateDuck(duck, leader = null) { /* ...código sem mudanças... */ duck.prevX = duck.x; duck.prevY = duck.y; if (leader) { const dist = distance(duck, leader); if (dist > FOLLOW_DISTANCE) { const angle = Math.atan2(leader.y - duck.y, leader.x - duck.x); duck.targetX = leader.x - Math.cos(angle) * FOLLOW_DISTANCE * 0.9; duck.targetY = leader.y - Math.sin(angle) * FOLLOW_DISTANCE * 0.9; duck.x = lerp(duck.x, duck.targetX, FOLLOWER_SPEED); duck.y = lerp(duck.y, duck.targetY, FOLLOWER_SPEED); } else { duck.targetX = duck.x; duck.targetY = duck.y; } } else { duck.x = lerp(duck.x, duck.targetX, PLAYER_SPEED); duck.y = lerp(duck.y, duck.targetY, PLAYER_SPEED); duck.x = Math.max(duck.drawWidth / 2, Math.min(canvasWidth - duck.drawWidth / 2, duck.x)); duck.y = Math.max(duck.drawHeight / 2, Math.min(canvasHeight - duck.drawHeight / 2, duck.y)); } const dx = duck.x - duck.prevX; if (dx > FLIP_THRESHOLD) { duck.facingDirection = 'right'; } else if (dx < -FLIP_THRESHOLD) { duck.facingDirection = 'left'; } const moved = Math.abs(duck.x - duck.prevX) > 0.1 || Math.abs(duck.y - duck.prevY) > 0.1; duck.isMoving = moved; if (duck.isMoving) { duck.animationTick++; if (duck.animationTick >= ANIMATION_SPEED) { duck.animationFrame = (duck.animationFrame + 1) % duck.images.length; duck.animationTick = 0; } duck.bobbingOffset = Math.sin((duck.animationFrame + duck.animationTick / ANIMATION_SPEED) * Math.PI) * BOBBING_AMOUNT; } else { duck.animationTick = 0; duck.bobbingOffset = 0; } if (duck.isEvil && duck.attackCooldown > 0) { duck.attackCooldown--; } }
function setStarAppearance(starImgElement, isFilled) { starImgElement.src = isFilled ? starFilledPath : starEmptyPath; }
function displayUnlockNotification(itemName, imageSrc) { if (!unlockNotificationElement || !unlockImageElement || !unlockTextElement) return; if (notificationTimeout) clearTimeout(notificationTimeout); unlockTextElement.textContent = `"${itemName}" Desbloqueado!`; unlockImageElement.src = imageSrc; unlockImageElement.alt = itemName; unlockNotificationElement.classList.remove('hidden', 'visible'); void unlockNotificationElement.offsetWidth; unlockNotificationElement.classList.add('visible'); console.log("Mostrando notificação:", itemName); notificationTimeout = setTimeout(() => { unlockNotificationElement.classList.remove('visible'); notificationTimeout = null; console.log("Escondendo notificação:", itemName); }, NOTIFICATION_DURATION); }

function showCompletionScreen() {
    if (gameComplete) return; // Previne sobreposição se já for game over
    gameComplete = true; // Marca como completo
    const survivalRate = initialGoodDucklings > 0 ? (score / initialGoodDucklings) * 100 : 100;
    if (survivalRate >= THREE_STAR_THRESHOLD) starsEarned = 3;
    else if (survivalRate >= TWO_STAR_THRESHOLD) starsEarned = 2;
    else if (survivalRate >= ONE_STAR_THRESHOLD) starsEarned = 1;
    else starsEarned = 0;

    const phaseJustCompleted = currentPhase;
    console.log(`Fim Fase ${phaseJustCompleted} | Bons Iniciais: ${initialGoodDucklings} | Salvos: ${score} | Taxa: ${survivalRate.toFixed(1)}% | Duckstars: ${starsEarned}`);
    const previousHighest = highestPhaseReached;
    highestPhaseReached = Math.max(highestPhaseReached, phaseJustCompleted);
    const currentBestStars = phaseStars[phaseJustCompleted] || 0;
    phaseStars[phaseJustCompleted] = Math.max(currentBestStars, starsEarned);
    saveGameData();

    let playerUnlockedSomething = false;
    customizations.forEach(cust => { if (cust.unlockPhasePlayer === phaseJustCompleted && phaseJustCompleted > previousHighest && cust.id !== 'default') { console.log(`Notificando desbloqueio JOGADOR: ${cust.name}`); displayUnlockNotification(cust.name, cust.playerFrames[0]); playerUnlockedSomething = true; } });
    if (!playerUnlockedSomething) { customizations.forEach(cust => { const followerUnlockPhase = Math.max(1, cust.unlockPhasePlayer - 2); if (followerUnlockPhase === phaseJustCompleted && phaseJustCompleted > previousHighest && cust.id !== 'default') { console.log(`Notificando desbloqueio SEGUIDOR: ${cust.name}`); displayUnlockNotification(`${cust.name} (Patinho)`, cust.followerFrames[0]); } }); }

    for (let i = 0; i < 3; i++) { setStarAppearance(starElements[i], i < starsEarned); }
    completionPhaseElement.textContent = `Fase ${phaseJustCompleted} Completa!`;
    completionResultElement.textContent = `Patos Salvos: ${score} / ${initialGoodDucklings}`;
    starCountTextElement.textContent = `(${starsEarned} Duckstar${starsEarned !== 1 ? 's' : ''}!)`;

    stopBackgroundMusic(); // Para a música
    playLoadedSound(completeSoundBuffer, 1.0); // Toca som de vitória

    canvas.classList.remove('hide-cursor');
    gameOverOverlay.classList.add('hidden'); // Garante que o de game over esteja escondido
    completionOverlay.classList.remove('hidden'); // Mostra o de conclusão
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } // Para o loop
}

// Função para acionar o Game Over
function triggerGameOver() {
    if (gameComplete) return; // Não aciona se já terminou (seja por vitória ou outra derrota)
    console.log("Game Over triggered - Rapid loss");
    gameComplete = true; // Marca como terminado
    stopBackgroundMusic();
    playLoadedSound(gameOverSoundBuffer, 1.0); // ALTERADO: Toca o som específico de game over

    canvas.classList.remove('hide-cursor');
    completionOverlay.classList.add('hidden'); // Esconde o overlay de conclusão
    gameOverOverlay.classList.remove('hidden'); // Mostra o overlay de game over

    if (animationFrameId) { // Para o loop do jogo
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}


function update() {
    if (gameComplete) return; // Se o jogo já acabou (vitória ou game over), não faz nada
    globalTick++;

    // Atualiza o jogador e seus seguidores primeiro
    updateDuck(player);
    let leader = player;
    for (const follower of player.followers) {
        updateDuck(follower, leader);
        leader = follower;
    }

    let goodDucksLeftInWild = false;
    for (let i = wildDucklings.length - 1; i >= 0; i--) {
        // Se o jogo acabou durante o processamento deste loop (por game over), sai
        if (gameComplete) break;

        const duckling = wildDucklings[i];
        // Movimento aleatório dos patos selvagens
        if (!duckling.isFollowing && globalTick % 120 === 0 && Math.random() < 0.2) {
             duckling.targetX = duckling.x + (Math.random() - 0.5) * 50;
             duckling.targetY = duckling.y + (Math.random() - 0.5) * 50;
        }
        updateDuck(duckling); // Atualiza o estado do patinho (posição, animação, etc.)

        if (duckling.isEvil) {
            if (duckling.attackCooldown <= 0) {
                for (let j = player.followers.length - 1; j >= 0; j--) {
                     // Se o jogo acabou durante o processamento deste loop interno, sai
                    if (gameComplete) break;

                    const follower = player.followers[j];
                    if (distance(duckling, follower) < EVIL_ATTACK_RADIUS) {
                        playLoadedSound(dieSoundBuffer, 1.0); // Toca som de morte normal
                        player.followers.splice(j, 1);
                        score--;
                        updateScoreDisplay();
                        duckling.attackCooldown = EVIL_ATTACK_COOLDOWN;

                        // --- Lógica de Game Over por Perda Rápida --- START
                        const now = Date.now();
                        recentLossTimestamps.push(now);
                        recentLossTimestamps = recentLossTimestamps.filter(ts => now - ts <= RAPID_LOSS_TIMEFRAME_MS);
                        if (recentLossTimestamps.length >= MAX_RAPID_LOSSES) { // Usa a constante atualizada
                            triggerGameOver(); // Aciona o Game Over (agora toca o som correto)
                        }
                        // --- Lógica de Game Over por Perda Rápida --- END
                        break; // Sai do loop interno de seguidores após um ataque bem-sucedido
                    }
                }
            }
        }
        else { // É um patinho bom
            goodDucksLeftInWild = true; // Marca que ainda existem patos bons
            // Verifica se o jogador está perto o suficiente para recrutar
            if (distance(player, duckling) < RECRUIT_RADIUS) {
                duckling.isFollowing = true;
                duckling.targetX = player.x; // Define o alvo inicial
                duckling.targetY = player.y;
                player.followers.unshift(duckling); // Adiciona ao início da fila de seguidores
                wildDucklings.splice(i, 1); // Remove da lista de selvagens
                score++; updateScoreDisplay();
                playLoadedSound(recruitSoundBuffer, 1.0);
            }
        }
    }

    // Verifica a condição de vitória APENAS se o jogo não acabou por Game Over
    if (!goodDucksLeftInWild && !gameComplete) {
        console.log("Condição de conclusão atingida.");
        showCompletionScreen(); // Chama a função de conclusão
    }
}

// --- Renderização (sem alterações) ---
function drawDuck(duck) { if (!duck.images || !duck.images[0] || !duck.images[1] || !duck.images[0].complete || !duck.images[1].complete) { return; } const img = duck.images[duck.animationFrame]; const drawY = duck.y - duck.drawHeight / 2 - duck.bobbingOffset; if (duck.facingDirection === 'left') { ctx.save(); ctx.translate(duck.x, drawY + duck.drawHeight / 2); ctx.scale(-1, 1); ctx.drawImage(img, -duck.drawWidth / 2, -duck.drawHeight / 2, duck.drawWidth, duck.drawHeight); ctx.restore(); } else { ctx.drawImage(img, duck.x - duck.drawWidth / 2, drawY, duck.drawWidth, duck.drawHeight); } }
function draw() { if (gameComplete) { return; } ctx.clearRect(0, 0, canvasWidth, canvasHeight); wildDucklings.forEach(drawDuck); for (let i = player.followers.length - 1; i >= 0; i--) { drawDuck(player.followers[i]); } drawDuck(player); }
function updateScoreDisplay() { scoreElement.textContent = `Patos Salvos: ${score}`; }
// --- Loop Principal ---
let animationFrameId = null;
function gameLoop() { if (gameComplete) { cancelAnimationFrame(animationFrameId); animationFrameId = null; return; } update(); draw(); animationFrameId = requestAnimationFrame(gameLoop); }

// --- Inicialização da Aplicação (sem alterações) ---
function initApp() { loadGameData(); setupAudio(); populateCustomizationOptions(); showScreen('main-menu'); }

// --- Geração Dinâmica de Opções de Customização (sem alterações) ---
function populateCustomizationOptions() { playerCustomizationOptionsContainer.innerHTML = ''; followerCustomizationOptionsContainer.innerHTML = ''; customizations.forEach(cust => { playerCustomizationOptionsContainer.appendChild(createOptionElement(cust, 'player')); followerCustomizationOptionsContainer.appendChild(createOptionElement(cust, 'follower')); }); }
function createOptionElement(cust, type) { const optionDiv = document.createElement('div'); optionDiv.classList.add('customization-option'); optionDiv.dataset.id = cust.id; const img = document.createElement('img'); img.src = (type === 'player' ? cust.playerFrames : cust.followerFrames)[0]; img.alt = cust.name; optionDiv.appendChild(img); const nameSpan = document.createElement('span'); nameSpan.textContent = cust.name; optionDiv.appendChild(nameSpan); const unlockPhase = (type === 'player') ? cust.unlockPhasePlayer : Math.max(1, cust.unlockPhasePlayer - 2); if (unlockPhase > highestPhaseReached) { optionDiv.classList.add('locked'); optionDiv.dataset.unlockPhase = unlockPhase; } else { optionDiv.addEventListener('click', () => { playLoadedSound(gameClickSoundBuffer, GAME_CLICK_VOLUME); /* QUACK */ if (type === 'player') { selectPlayerCustomization(cust.id); } else { selectFollowerCustomization(cust.id); } }); } const currentSelectionId = (type === 'player') ? selectedPlayerCustomizationId : selectedFollowerCustomizationId; if (cust.id === currentSelectionId) { optionDiv.classList.add('selected'); } return optionDiv; }
// --- Seleção de Customização (sem alterações) ---
function selectPlayerCustomization(customizationId) { const selectedOptionData = customizations.find(c => c.id === customizationId); if (!selectedOptionData || selectedOptionData.unlockPhasePlayer > highestPhaseReached) { return; } console.log("Jogador Selecionado:", customizationId); selectedPlayerCustomizationId = customizationId; saveGameData(); playerCustomizationOptionsContainer.querySelectorAll('.customization-option').forEach(opt => { opt.classList.toggle('selected', opt.dataset.id === customizationId); }); }
function selectFollowerCustomization(customizationId) { const selectedOptionData = customizations.find(c => c.id === customizationId); const followerUnlockPhase = Math.max(1, selectedOptionData.unlockPhasePlayer - 2); if (!selectedOptionData || followerUnlockPhase > highestPhaseReached) { return; } console.log("Seguidor Selecionado:", customizationId); selectedFollowerCustomizationId = customizationId; saveGameData(); followerCustomizationOptionsContainer.querySelectorAll('.customization-option').forEach(opt => { opt.classList.toggle('selected', opt.dataset.id === customizationId); }); }

// --- Event Listeners (sem alterações) ---
function addButtonListeners(buttonElement) { buttonElement.addEventListener('click', () => { playLoadedSound(uiClickSoundBuffer, UI_CLICK_VOLUME); }); buttonElement.addEventListener('mouseenter', () => { playLoadedSound(hoverSoundBuffer, UI_HOVER_VOLUME); }); }
addButtonListeners(startGameButton); addButtonListeners(customizeButton); addButtonListeners(backToMenuButton); addButtonListeners(nextPhaseSvgButton); addButtonListeners(retrySvgButton); addButtonListeners(backToMenuCompleteButton);
addButtonListeners(retryGameOverButton);
addButtonListeners(backToMenuGameOverButton);

startGameButton.addEventListener('click', () => { currentPhase = 1; showScreen('game-container'); initGame(); });
customizeButton.addEventListener('click', () => { populateCustomizationOptions(); showScreen('customization-screen'); });
backToMenuButton.addEventListener('click', () => { showScreen('main-menu'); });
nextPhaseSvgButton.addEventListener('click', () => { // Continua funcionando apenas se veio da tela de sucesso
    if (!gameOverOverlay.classList.contains('hidden')) return; // Não faz nada se o game over estiver visível
    currentPhase++;
    showScreen('game-container');
    initGame();
});
retrySvgButton.addEventListener('click', () => { // Continua funcionando apenas se veio da tela de sucesso
    if (!gameOverOverlay.classList.contains('hidden')) return;
    showScreen('game-container');
    initGame(); // Reinicia a fase atual
});
backToMenuCompleteButton.addEventListener('click', () => { // Continua funcionando apenas se veio da tela de sucesso
     if (!gameOverOverlay.classList.contains('hidden')) return;
    showScreen('main-menu');
});

// --- NOVOS LISTENERS PARA TELA DE GAME OVER ---
retryGameOverButton.addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden'); // Esconde overlay antes de reiniciar
    showScreen('game-container');
    initGame(); // Reinicia a fase atual
});
backToMenuGameOverButton.addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden'); // Esconde overlay antes de ir pro menu
    showScreen('main-menu');
});

// --- Listeners restantes (sem alterações) ---
canvas.addEventListener('mousemove', (event) => { if (!gameComplete) { const rect = canvas.getBoundingClientRect(); player.targetX = event.clientX - rect.left; player.targetY = event.clientY - rect.top; } });
canvas.addEventListener('click', (event) => { if (gameComplete) return; const rect = canvas.getBoundingClientRect(); const clickX = event.clientX - rect.left; const clickY = event.clientY - rect.top; let clickedEvilDuck = false; for (let i = wildDucklings.length - 1; i >= 0; i--) { const duckling = wildDucklings[i]; if (duckling.isEvil) { const dist = Math.sqrt((clickX - duckling.x)**2 + (clickY - duckling.y)**2); if (dist < CLICK_REMOVE_RADIUS) { console.log("Patinho mau espantado!"); playEvilDefeatSound(); wildDucklings.splice(i, 1); clickedEvilDuck = true; break; } } } if (!clickedEvilDuck) { playLoadedSound(gameClickSoundBuffer, GAME_CLICK_VOLUME); } });
window.addEventListener('resize', () => { canvasWidth = window.innerWidth; canvasHeight = window.innerHeight; canvas.width = canvasWidth; canvas.height = canvasHeight; if (!gameContainerScreen.classList.contains('hidden')) { stopBackgroundMusic(); console.log("Janela redimensionada durante o jogo. Reiniciando fase atual."); initGame(); ctx.imageSmoothingEnabled = false; } });

// --- Início da Aplicação ---
window.onload = initApp;
