document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("dblclick", function(e) { e.preventDefault(); }, { passive: false });

    const PLACEHOLDER_IMAGE = './torifuda/tori_0.png';
    const STORAGE_KEYS = {
        history: 'fudanagashi:history',
        letters: 'fudanagashi:letters',
        reverse: 'fudanagashi:reverseEnabled'
    };
    const HISTORY_LIMIT = 3;

    const LETTER_GROUPS = [
        { id: 'one', title: '1枚札', letters: ['む', 'す', 'め', 'ふ', 'さ', 'ほ', 'せ'], mode: 'bundle', description: 'むすめふさほせ' },
        { id: 'two', title: '2枚札', letters: ['う', 'つ', 'し', 'も', 'ゆ'], mode: 'single' },
        { id: 'three', title: '3枚札', letters: ['い', 'ち', 'ひ', 'き'], mode: 'single' },
        { id: 'four', title: '4枚札', letters: ['は', 'や', 'よ', 'か'], mode: 'single' },
        { id: 'five', title: '5枚札', letters: ['み'], mode: 'single' },
        { id: 'six', title: '6枚札', letters: ['た', 'こ'], mode: 'single' },
        { id: 'seven', title: '7枚札', letters: ['お', 'わ'], mode: 'single' },
        { id: 'eight', title: '8枚札', letters: ['な'], mode: 'single' },
        { id: 'sixteen', title: '16枚札', letters: ['あ'], mode: 'single' }
    ];

    const letterToFudaMap = buildLetterToFudaMap();

    // HTML要素の取得
    const imageElement = document.getElementById('random-image');
    const reloadButton = document.getElementById('reload-button');
    const kimariji = document.getElementById('kimariji');
    const kimarijiButton = document.getElementById('kimariji-button');
    const topScreen = document.getElementById('top-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const openSettingsButton = document.getElementById('open-settings-button');
    const openStudyButton = document.getElementById('open-study-button');
    const selectionSummary = document.getElementById('selection-summary');
    const timeHistoryElement = document.getElementById('time-history');
    const settingsModal = document.getElementById('settings-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeSettingsButton = document.getElementById('close-settings');
    const individualSettingsList = document.getElementById('individual-settings-list');
    const individualSettingsPanel = document.getElementById('individual-settings-panel');
    const bulkSettingsPanel = document.getElementById('bulk-settings-panel');
    const bulkSettingsList = document.getElementById('bulk-settings-list');
    const toggleIndividualSettingsButton = document.getElementById('toggle-individual-settings');
    const enableAllButton = document.getElementById('enable-all-button');
    const disableAllButton = document.getElementById('disable-all-button');
    const reverseToggleButton = document.getElementById('reverse-toggle');
    const studyListScreen = document.getElementById('study-list-screen');
    const studyDetailScreen = document.getElementById('study-detail-screen');
    const studyCloseButton = document.getElementById('study-close-button');
    const studyDetailBackButton = document.getElementById('study-detail-back-button');
    const studyDetailPrevButton = document.getElementById('study-detail-prev-button');
    const studyDetailNextButton = document.getElementById('study-detail-next-button');
    const studyListContainer = document.getElementById('study-list-container');
    const studyListMessage = document.getElementById('study-list-message');
    const studyDetailImage = document.getElementById('study-detail-image');
    const studyDetailKimariji = document.getElementById('study-detail-kimariji');
    const studyDetailUpper = document.getElementById('study-detail-upper');
    const studyDetailLower = document.getElementById('study-detail-lower');
    const studyDetailNumber = document.getElementById('study-detail-number');
    const studyDetailAuthor = document.getElementById('study-detail-author');
    const studyDetailSelectionToggle = document.getElementById('study-detail-selection-toggle');
    const studyDetailInfo = document.querySelector('.study-detail-info');
    const views = Array.from(document.querySelectorAll('.view'));
    const kimarijiButtonText = kimarijiButton ? kimarijiButton.querySelector('.action-button-text') : null;
    const goroModal = document.getElementById('goro-modal');
    const goroModalOverlay = document.getElementById('goro-modal-overlay');
    const goroModalImage = document.getElementById('goro-modal-image');
    const goroModalCloseButton = document.getElementById('goro-modal-close');

    let fudaOrder = [];
    let startTime;
    let currentFuda = 0;
    let activeFudaPool = [];
    let fudaSelectionState = loadFudaSelectionState();
    let reverseEnabled = loadReverseSetting();

    let timeHistory = loadHistory();
    let studyItems = [];
    const studyItemMap = new Map();
    let studyDataLoaded = false;
    let studyDataLoadError = false;
    let currentStudyIndex = -1;
    const KIMARIJI_BUTTON_STATE = {
        reveal: 'reveal',
        goro: 'goro'
    };
    const KIMARIJI_BUTTON_GORO_CLASS = 'action-button--goro';
    const STUDY_DETAIL_INFO_TOGGLE_CLASS = 'study-detail-info--toggleable';
    let kimarijiButtonState = KIMARIJI_BUTTON_STATE.reveal;
    let currentGoroImagePath = '';
    let currentFudaLabel = '';

    buildIndividualSettingsUI();
    buildBulkSettingsUI();
    syncSettingsUI();
    updateStudyDetailSelectionToggle();
    updateSelectionSummary();
    renderTimeHistory();
    setKimarijiButtonState(KIMARIJI_BUTTON_STATE.reveal);

    function formatTime(ms) {
        if (!Number.isFinite(ms)) {
            return '--';
        }
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes > 0) {
            return `${minutes}分${String(seconds).padStart(2, '0')}秒`;
        }
        return `${seconds}秒`;
    }

    function loadHistory() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.history));
            if (Array.isArray(raw)) {
                return raw.filter(entry => Number.isFinite(entry.timeMs) && Number.isFinite(entry.cards)).slice(0, HISTORY_LIMIT);
            }
        } catch (e) {
            console.warn('タイム履歴の読み込みに失敗しました。');
        }
        return [];
    }

    function saveHistory() {
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(timeHistory));
    }

    function addHistoryEntry(timeMs, cardCount) {
        const entry = {
            timeMs,
            cards: cardCount,
            recordedAt: Date.now()
        };
        timeHistory = [entry, ...timeHistory].slice(0, HISTORY_LIMIT);
        saveHistory();
    }

    function renderTimeHistory() {
        timeHistoryElement.innerHTML = '';
        if (timeHistory.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'time-history-empty';
            emptyItem.textContent = 'まだ記録がありません';
            timeHistoryElement.appendChild(emptyItem);
            return;
        }

        timeHistory.forEach((entry, index) => {
            const item = document.createElement('li');
            item.className = 'time-entry';

            const label = document.createElement('span');
            label.className = 'time-entry-label';
            label.textContent = `${index + 1}回前`;

            const value = document.createElement('span');
            value.className = 'time-entry-value';
            value.textContent = `${formatTime(entry.timeMs)}（${entry.cards}枚）`;

            item.appendChild(label);
            item.appendChild(value);
            timeHistoryElement.appendChild(item);
        });
    }

    function setKimarijiButtonState(state) {
        kimarijiButtonState = state;
        const isGoro = state === KIMARIJI_BUTTON_STATE.goro;
        if (kimarijiButtonText) {
            kimarijiButtonText.textContent = isGoro ? '覚え方を見る' : '決まり字を見る';
        }
        if (kimarijiButton) {
            kimarijiButton.classList.toggle(KIMARIJI_BUTTON_GORO_CLASS, isGoro);
        }
    }

    function showKimarijiText() {
        if (!kimariji) {
            return;
        }
        kimariji.style.display = 'flex';
        setKimarijiButtonState(KIMARIJI_BUTTON_STATE.goro);
    }

    function hideKimarijiText() {
        if (!kimariji) {
            return;
        }
        kimariji.style.display = 'none';
        setKimarijiButtonState(KIMARIJI_BUTTON_STATE.reveal);
    }

    function resetKimarijiDisplay() {
        if (kimariji) {
            kimariji.textContent = '';
        }
        hideKimarijiText();
    }

    function buildLetterToFudaMap() {
        const map = new Map();
        fudalist.forEach(fuda => {
            const key = (fuda.kimariji || '').charAt(0);
            if (!key) {
                return;
            }
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(String(fuda.no));
        });
        return map;
    }

    function getFudaKey(value) {
        if (value && typeof value === 'object') {
            return String(value.no);
        }
        return String(value);
    }

    function getFudaNosForLetter(letter) {
        return letterToFudaMap.get(letter) || [];
    }

    function getGoroSlidePath(fuda) {
        if (!fuda || typeof fuda !== 'object') {
            return '';
        }
        const imageFile = typeof fuda.goroImage === 'string' ? fuda.goroImage.trim() : '';
        if (!imageFile) {
            return '';
        }
        return `./goro_slide/${imageFile}`;
    }

    function loadFudaSelectionState() {
        const defaults = {};
        let needsMigration = false;
        fudalist.forEach(fuda => {
            defaults[getFudaKey(fuda)] = false;
        });
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.letters));
            if (stored && typeof stored === 'object') {
                const storedKeys = Object.keys(stored);
                const hasNumericKeys = storedKeys.some(key => key in defaults);
                if (hasNumericKeys) {
                    storedKeys.forEach(key => {
                        if (key in defaults && typeof stored[key] === 'boolean') {
                            defaults[key] = stored[key];
                        }
                    });
                } else {
                    needsMigration = true;
                    storedKeys.forEach(letter => {
                        if (typeof stored[letter] !== 'boolean') {
                            return;
                        }
                        getFudaNosForLetter(letter).forEach(fudaNo => {
                            defaults[fudaNo] = stored[letter];
                        });
                    });
                }
            }
        } catch (e) {
            console.warn('設定の読み込みに失敗しました。デフォルト値を使用します。');
        }
        if (needsMigration) {
            localStorage.setItem(STORAGE_KEYS.letters, JSON.stringify(defaults));
        }
        return defaults;
    }

    function saveFudaSelectionState() {
        localStorage.setItem(STORAGE_KEYS.letters, JSON.stringify(fudaSelectionState));
    }

    function loadReverseSetting() {
        const stored = localStorage.getItem(STORAGE_KEYS.reverse);
        if (stored === null) {
            return false;
        }
        return stored === 'true';
    }

    function saveReverseSetting() {
        localStorage.setItem(STORAGE_KEYS.reverse, reverseEnabled ? 'true' : 'false');
    }

    function isFudaEnabledByNo(fudaNo) {
        const key = getFudaKey(fudaNo);
        return fudaSelectionState[key] !== false;
    }

    function isFudaEnabled(fuda) {
        return isFudaEnabledByNo(fuda.no);
    }

    function setFudaState(fudaNo, enabled) {
        const key = getFudaKey(fudaNo);
        fudaSelectionState[key] = Boolean(enabled);
    }

    function applyToLetters(letters, enabled) {
        letters.forEach(letter => {
            const targets = getFudaNosForLetter(letter);
            targets.forEach(no => {
                setFudaState(no, enabled);
            });
        });
    }

    function setAllFudaStates(enabled) {
        fudalist.forEach(fuda => {
            setFudaState(fuda.no, enabled);
        });
    }

    function createToggleButton(label, extraClasses = []) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'toggle-button';
        extraClasses.forEach(cls => button.classList.add(cls));
        button.textContent = label;
        button.setAttribute('aria-pressed', 'false');
        return button;
    }

    function setToggleButtonState(button, isActive) {
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    }

    function buildIndividualSettingsUI() {
        if (!individualSettingsList) {
            return;
        }
        const sorted = fudalist
            .map((fuda, index) => ({
                ...fuda,
                __order: Number.isFinite(fuda.studyOrder) ? fuda.studyOrder : index + 1
            }))
            .sort((a, b) => a.__order - b.__order);
        individualSettingsList.innerHTML = '';
        sorted.forEach(fuda => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'individual-setting-button';
            button.dataset.fudaNo = getFudaKey(fuda);

            const kimarijiSpan = document.createElement('span');
            kimarijiSpan.className = 'kimariji';
            kimarijiSpan.textContent = fuda.kimariji || '---';

            button.appendChild(kimarijiSpan);
            individualSettingsList.appendChild(button);
        });
    }

    function buildBulkSettingsUI() {
        if (!bulkSettingsList) {
            return;
        }
        bulkSettingsList.innerHTML = '';
        LETTER_GROUPS.forEach(group => {
            const section = document.createElement('section');
            section.className = 'settings-group';

            const heading = document.createElement('h3');
            heading.textContent = group.title;
            section.appendChild(heading);

            if (group.mode === 'bundle') {
                const button = createToggleButton(`${group.description}`, ['bundle-button']);
                button.dataset.bundle = 'true';
                button.dataset.letters = group.letters.join(',');
                section.appendChild(button);
            } else {
                const grid = document.createElement('div');
                grid.className = 'settings-grid';
                group.letters.forEach(letter => {
                    const button = createToggleButton(letter, ['letter-button']);
                    button.dataset.letter = letter;
                    grid.appendChild(button);
                });
                section.appendChild(grid);
            }
            bulkSettingsList.appendChild(section);
        });
    }

    function syncIndividualSettingsUI() {
        if (!individualSettingsList) {
            return;
        }
        const buttons = individualSettingsList.querySelectorAll('.individual-setting-button');
        buttons.forEach(button => {
            const isActive = isFudaEnabledByNo(button.dataset.fudaNo);
            button.classList.toggle('is-on', isActive);
            button.classList.toggle('is-off', !isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function syncBulkSettingsUI() {
        if (!bulkSettingsList) {
            return;
        }
        const buttons = bulkSettingsList.querySelectorAll('.toggle-button');
        buttons.forEach(button => {
            let isActive = false;
            if (button.dataset.bundle === 'true') {
                const letters = button.dataset.letters.split(',');
                isActive = letters.every(letter => {
                    const targets = getFudaNosForLetter(letter);
                    return targets.length > 0 && targets.every(no => isFudaEnabledByNo(no));
                });
            } else if (button.dataset.letter) {
                const targets = getFudaNosForLetter(button.dataset.letter);
                isActive = targets.length > 0 && targets.every(no => isFudaEnabledByNo(no));
            }
            setToggleButtonState(button, isActive);
        });
    }

    function syncReverseToggle() {
        if (!reverseToggleButton) {
            return;
        }
        reverseToggleButton.classList.toggle('active', reverseEnabled);
        reverseToggleButton.textContent = reverseEnabled ? 'オン' : 'オフ';
        reverseToggleButton.setAttribute('aria-pressed', String(reverseEnabled));
    }

    function syncSettingsUI() {
        syncReverseToggle();
        syncIndividualSettingsUI();
        syncBulkSettingsUI();
    }

    function scrollToPanel(targetPanel) {
        if (!targetPanel) {
            return;
        }
        targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        focusAfterScroll(targetPanel);
    }

    function focusAfterScroll(target) {
        if (typeof target.focus !== 'function') {
            return;
        }
        const focusTarget = target.hasAttribute('tabindex') ? target : target.querySelector('[tabindex], button, h3, div');
        if (!focusTarget || typeof focusTarget.focus !== 'function') {
            return;
        }
        setTimeout(() => {
            focusTarget.focus({ preventScroll: true });
        }, 350);
    }

    function handleSelectionStateChanged() {
        saveFudaSelectionState();
        syncSettingsUI();
        updateSelectionSummary();
        updateStudyDetailSelectionToggle();
    }

    function updateSelectionSummary() {
        const available = getSelectedFudaList().length;
        if (available === 0) {
            selectionSummary.textContent = 'チェックする札が未設定です';
            startButton.disabled = true;
        } else {
            selectionSummary.textContent = `現在の設定枚数：${available}枚`;
            startButton.disabled = false;
        }
    }

    function getSelectedFudaList() {
        return fudalist.filter(fuda => isFudaEnabled(fuda));
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function prepareGame() {
        activeFudaPool = getSelectedFudaList();
        if (activeFudaPool.length === 0) {
            alert('使用する札が選択されていません。');
            return false;
        }
        fudaOrder = shuffleArray([...activeFudaPool]);
        currentFuda = 0;
        startTime = null;
        imageElement.src = PLACEHOLDER_IMAGE;
        currentGoroImagePath = '';
        currentFudaLabel = '';
        closeGoroModal();
        resetKimarijiDisplay();
        return true;
    }

    function switchView(targetView) {
        views.forEach(view => {
            if (view === targetView) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });
    }

    function showGameScreen() {
        switchView(gameScreen);
    }

    function returnToTop() {
        switchView(topScreen);
        imageElement.src = PLACEHOLDER_IMAGE;
        currentGoroImagePath = '';
        currentFudaLabel = '';
        closeGoroModal();
        resetKimarijiDisplay();
        currentFuda = 0;
        startTime = null;
        fudaOrder = [];
        activeFudaPool = [];
        currentStudyIndex = -1;
        updateStudyDetailNavButtons();
        updateStudyDetailSelectionToggle();
    }

    function displayFuda(orderIndex) {
        const fuda = fudaOrder[orderIndex];
        const useReverse = reverseEnabled && Math.random() < 0.5;
        imageElement.src = useReverse ? fuda.reverse : fuda.normal;
        kimariji.textContent = fuda.kimariji;
        currentGoroImagePath = getGoroSlidePath(fuda);
        currentFudaLabel = fuda.kimariji || '';
    }

    function stopTimer() {
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        alert(`終わりです。${minutes}分${remainingSeconds}秒でした！`);

        const cardsUsed = fudaOrder.length;
        addHistoryEntry(elapsedTime, cardsUsed);
        renderTimeHistory();

        returnToTop();
        updateSelectionSummary();
    }

    function openSettings() {
        settingsModal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
    }

    function closeSettings() {
        settingsModal.classList.add('hidden');
        modalOverlay.classList.add('hidden');
    }

    function openGoroModal(imagePath) {
        if (!imagePath || !goroModal || !goroModalOverlay || !goroModalImage) {
            return;
        }
        const labelText = currentFudaLabel ? `${currentFudaLabel}の語呂合わせ画像` : '語呂合わせ画像';
        goroModalImage.src = imagePath;
        goroModalImage.alt = labelText;
        goroModal.classList.remove('hidden');
        goroModalOverlay.classList.remove('hidden');
    }

    function closeGoroModal() {
        if (!goroModal || !goroModalOverlay || !goroModalImage) {
            return;
        }
        goroModal.classList.add('hidden');
        goroModalOverlay.classList.add('hidden');
        goroModalImage.src = '';
        goroModalImage.alt = '語呂合わせ画像';
    }

    // 決まり字の表示／覚え方モーダル
    kimarijiButton.addEventListener('click', function() {
        if (kimarijiButtonState === KIMARIJI_BUTTON_STATE.goro) {
            if (!currentGoroImagePath) {
                alert('この札の覚え方画像は登録されていません。');
                return;
            }
            openGoroModal(currentGoroImagePath);
            return;
        }
        if (window.getComputedStyle(kimariji).display === 'none' && kimariji.textContent) {
            showKimarijiText();
        }
    });

    imageElement.addEventListener('click', () => {
        if (gameScreen.classList.contains('hidden') || fudaOrder.length === 0) {
            return;
        }
        closeGoroModal();
        if (currentFuda === fudaOrder.length) {
            stopTimer();
            return;
        }
        if (currentFuda === 0) {
            startTime = Date.now();
        }
        displayFuda(currentFuda);
        currentFuda++;
        hideKimarijiText();
    });

    if (goroModalOverlay) {
        goroModalOverlay.addEventListener('click', closeGoroModal);
    }

    if (goroModalCloseButton) {
        goroModalCloseButton.addEventListener('click', closeGoroModal);
    }

    function confirmReturnToTop() {
        const confirmReset = window.confirm("トップ画面に戻ります。よろしいですか？");
        if (!confirmReset) {
            return;
        }
        returnToTop();
        updateSelectionSummary();
    }

    reloadButton.addEventListener('click', confirmReturnToTop);

    startButton.addEventListener('click', () => {
        if (!prepareGame()) {
            return;
        }
        showGameScreen();
    });

    openSettingsButton.addEventListener('click', () => {
        syncSettingsUI();
        openSettings();
    });

    closeSettingsButton.addEventListener('click', closeSettings);
    modalOverlay.addEventListener('click', closeSettings);

    if (toggleIndividualSettingsButton) {
        toggleIndividualSettingsButton.addEventListener('click', () => {
            scrollToPanel(individualSettingsPanel);
        });
    }

    if (reverseToggleButton) {
        reverseToggleButton.addEventListener('click', () => {
            reverseEnabled = !reverseEnabled;
            saveReverseSetting();
            syncReverseToggle();
        });
    }

    if (enableAllButton) {
        enableAllButton.addEventListener('click', () => {
            setAllFudaStates(true);
            handleSelectionStateChanged();
        });
    }

    if (disableAllButton) {
        disableAllButton.addEventListener('click', () => {
            setAllFudaStates(false);
            handleSelectionStateChanged();
        });
    }

    if (bulkSettingsList) {
        bulkSettingsList.addEventListener('click', (event) => {
            const target = event.target.closest('.toggle-button');
            if (!target) {
                return;
            }
            if (target.dataset.bundle === 'true') {
                const letters = target.dataset.letters.split(',');
                const allEnabled = letters.every(letter => {
                    const targets = getFudaNosForLetter(letter);
                    return targets.length > 0 && targets.every(no => isFudaEnabledByNo(no));
                });
                applyToLetters(letters, !allEnabled);
            } else if (target.dataset.letter) {
                const letter = target.dataset.letter;
                const targets = getFudaNosForLetter(letter);
                if (targets.length === 0) {
                    return;
                }
                const shouldEnable = !targets.every(no => isFudaEnabledByNo(no));
                targets.forEach(no => setFudaState(no, shouldEnable));
            }
            handleSelectionStateChanged();
        });
    }

    if (individualSettingsList) {
        individualSettingsList.addEventListener('click', (event) => {
            const button = event.target.closest('.individual-setting-button');
            if (!button) {
                return;
            }
            const fudaNo = button.dataset.fudaNo;
            setFudaState(fudaNo, !isFudaEnabledByNo(fudaNo));
            handleSelectionStateChanged();
        });
    }

    if (openStudyButton) {
        openStudyButton.addEventListener('click', () => {
            showStudyList();
        });
    }

    if (studyCloseButton) {
        studyCloseButton.addEventListener('click', () => {
            returnToTop();
        });
    }

    if (studyDetailBackButton) {
        studyDetailBackButton.addEventListener('click', () => {
            showStudyList();
        });
    }

    if (studyDetailPrevButton) {
        studyDetailPrevButton.addEventListener('click', () => {
            if (currentStudyIndex > 0) {
                const prevItem = studyItems[currentStudyIndex - 1];
                if (prevItem) {
                    showStudyDetail(prevItem.id);
                }
            }
        });
    }

    if (studyDetailNextButton) {
        studyDetailNextButton.addEventListener('click', () => {
            if (currentStudyIndex >= 0 && currentStudyIndex < studyItems.length - 1) {
                const nextItem = studyItems[currentStudyIndex + 1];
                if (nextItem) {
                    showStudyDetail(nextItem.id);
                }
            }
        });
    }

    if (studyDetailSelectionToggle) {
        studyDetailSelectionToggle.addEventListener('click', () => {
            toggleCurrentStudySelection();
        });
    }

    if (studyDetailInfo) {
        studyDetailInfo.addEventListener('click', (event) => {
            if (event.target.closest('.study-detail-selection-toggle')) {
                return;
            }
            toggleCurrentStudySelection();
        });
    }

    updateStudyDetailNavButtons();

    if (studyListContainer) {
        studyListContainer.addEventListener('click', (event) => {
            const card = event.target.closest('.study-card-button');
            if (!card) {
                return;
            }
            const studyId = card.dataset.studyId;
            if (studyId) {
                showStudyDetail(studyId);
            }
        });
    }

    function setStudyListMessage(message) {
        if (!studyListMessage) {
            return;
        }
        if (message) {
            studyListMessage.textContent = message;
            studyListMessage.classList.remove('hidden');
        } else {
            studyListMessage.textContent = '';
            studyListMessage.classList.add('hidden');
        }
    }

    function showStudyList() {
        if (!studyDataLoaded && !studyDataLoadError) {
            setStudyListMessage('データを読み込んでいます...');
        }
        currentStudyIndex = -1;
        updateStudyDetailSelectionToggle();
        if (studyListScreen) {
            switchView(studyListScreen);
        }
    }

    function showStudyDetail(studyId) {
        const key = String(studyId);
        const itemIndex = studyItemMap.get(key);
        if (!Number.isInteger(itemIndex) || !studyItems[itemIndex]) {
            alert('決まり字の情報を表示できませんでした。');
            return;
        }
        currentStudyIndex = itemIndex;
        const item = studyItems[itemIndex];
        if (studyDetailImage) {
            studyDetailImage.src = item.slide || PLACEHOLDER_IMAGE;
            studyDetailImage.alt = `${item.kimarijiText}の語呂合わせ画像`;
        }
        if (studyDetailKimariji) {
            studyDetailKimariji.textContent = item.kimarijiText || '不明';
        }
        if (studyDetailUpper) {
            studyDetailUpper.textContent = item.upperText || '---';
        }
        if (studyDetailLower) {
            studyDetailLower.textContent = item.lowerText || '---';
        }
        if (studyDetailNumber) {
            studyDetailNumber.textContent = Number.isFinite(item.no) ? `${item.no}番` : '---';
        }
        if (studyDetailAuthor) {
            studyDetailAuthor.textContent = item.authorText || '---';
        }
        updateStudyDetailNavButtons();
        updateStudyDetailSelectionToggle();
        if (studyDetailScreen) {
            switchView(studyDetailScreen);
        }
    }

    function updateStudyDetailNavButtons() {
        if (!studyDetailPrevButton || !studyDetailNextButton) {
            return;
        }
        const hasPrev = currentStudyIndex > 0;
        const hasNext = currentStudyIndex >= 0 && currentStudyIndex < studyItems.length - 1;
        studyDetailPrevButton.disabled = !hasPrev;
        studyDetailNextButton.disabled = !hasNext;
    }

    function updateStudyDetailSelectionToggle() {
        const currentItem = studyItems[currentStudyIndex];
        const hasTarget = Boolean(currentItem) && Number.isFinite(currentItem.fudaNo);

        if (studyDetailInfo) {
            studyDetailInfo.classList.toggle(STUDY_DETAIL_INFO_TOGGLE_CLASS, hasTarget);
        }
        if (!studyDetailSelectionToggle) {
            return;
        }
        studyDetailSelectionToggle.disabled = !hasTarget;
        if (!hasTarget) {
            studyDetailSelectionToggle.classList.remove('off');
            studyDetailSelectionToggle.textContent = '設定オン';
            studyDetailSelectionToggle.setAttribute('aria-pressed', 'true');
            return;
        }
        const isActive = isFudaEnabledByNo(currentItem.fudaNo);
        studyDetailSelectionToggle.classList.toggle('off', !isActive);
        studyDetailSelectionToggle.textContent = isActive ? '設定オン' : '設定オフ';
        studyDetailSelectionToggle.setAttribute('aria-pressed', String(isActive));
    }

    function toggleCurrentStudySelection() {
        const currentItem = studyItems[currentStudyIndex];
        if (!currentItem || !Number.isFinite(currentItem.fudaNo)) {
            return;
        }
        const nextState = !isFudaEnabledByNo(currentItem.fudaNo);
        setFudaState(currentItem.fudaNo, nextState);
        handleSelectionStateChanged();
    }

    function buildStudyItemsFromFudalist() {
        const enriched = fudalist
            .filter(fuda => fuda && typeof fuda === 'object')
            .map(fuda => ({
                ...fuda,
                studyOrder: Number.isFinite(fuda.studyOrder) ? fuda.studyOrder : fuda.no
            }))
            .sort((a, b) => a.studyOrder - b.studyOrder);

        return enriched.map((fuda, index) => {
            const imageFile = fuda.goroImage || '';
            return {
                id: `study-${index + 1}`,
                order: fuda.studyOrder,
                no: Number.isFinite(fuda.no) ? fuda.no : null,
                fudaNo: Number.isFinite(fuda.no) ? fuda.no : null,
                kimarijiText: fuda.kimariji || '',
                goroText: fuda.goro || '',
                classification: fuda.classification || '',
                upperText: fuda.upper || '',
                lowerText: fuda.lower || '',
                authorText: fuda.author || '',
                imageFile,
                thumbnail: imageFile ? `./goro_thumbnail/${imageFile}` : '',
                slide: imageFile ? `./goro_slide/${imageFile}` : ''
            };
        });
    }

    function getStudyGroupLabel(item) {
        return item.classification || '分類なし';
    }

    function buildStudyList(items) {
        if (!studyListContainer) {
            return;
        }
        studyListContainer.innerHTML = '';
        if (items.length === 0) {
            setStudyListMessage('表示できるデータがありません。');
            return;
        }
        const groupMap = new Map();
        items.forEach(item => {
            const label = getStudyGroupLabel(item);
            if (!groupMap.has(label)) {
                groupMap.set(label, []);
            }
            groupMap.get(label).push(item);
        });

        groupMap.forEach((groupItems, label) => {
            const section = document.createElement('section');
            section.className = 'study-category';

            const heading = document.createElement('h3');
            heading.className = 'study-category-title';
            heading.textContent = label;
            section.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'study-card-grid';

            groupItems.forEach(item => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'study-card-button';
                button.dataset.studyId = item.id;

                const img = document.createElement('img');
                img.src = item.thumbnail || PLACEHOLDER_IMAGE;
                img.alt = `${item.kimarijiText}の語呂合わせサムネイル`;

                const textWrapper = document.createElement('div');
                textWrapper.className = 'study-card-text';

                const kimarijiSpan = document.createElement('span');
                kimarijiSpan.className = 'study-card-kimariji';
                kimarijiSpan.textContent = item.kimarijiText || '---';

                const goroSpan = document.createElement('span');
                goroSpan.className = 'study-card-goro';
                goroSpan.textContent = item.goroText || '語呂合わせ情報なし';

                textWrapper.appendChild(kimarijiSpan);
                textWrapper.appendChild(goroSpan);
                button.appendChild(img);
                button.appendChild(textWrapper);
                grid.appendChild(button);
            });

            section.appendChild(grid);
            studyListContainer.appendChild(section);
        });
    }

    function loadStudyData() {
        try {
            const parsedItems = buildStudyItemsFromFudalist();
            studyItems = parsedItems;
            studyItemMap.clear();
            studyItems.forEach((item, index) => {
                studyItemMap.set(item.id, index);
            });
            if (studyItems.length === 0) {
                setStudyListMessage('表示できるデータがありません。');
            } else {
                buildStudyList(studyItems);
                setStudyListMessage('');
            }
            studyDataLoaded = true;
            studyDataLoadError = false;
        } catch (error) {
            console.warn('決まり字データの読み込みに失敗しました。', error);
            studyDataLoaded = false;
            studyDataLoadError = true;
            setStudyListMessage('データの読み込みに失敗しました。ページを再読み込みしてください。');
        }
    }

    function preloadFudaImages() {
        const imagePaths = new Set([PLACEHOLDER_IMAGE]);
        fudalist.forEach(({ normal, reverse }) => {
            imagePaths.add(normal);
            imagePaths.add(reverse);
        });

        const sources = Array.from(imagePaths);
        let index = 0;
        const CHUNK_SIZE = 8;

        const loadChunk = (deadline) => {
            let processed = 0;
            while (index < sources.length && processed < CHUNK_SIZE) {
                if (deadline && deadline.timeRemaining() <= 0) {
                    break;
                }
                const img = new Image();
                img.src = sources[index];
                index++;
                processed++;
            }

            if (index < sources.length) {
                if (window.requestIdleCallback) {
                    requestIdleCallback(loadChunk);
                } else {
                    setTimeout(loadChunk, 16);
                }
            }
        };

        if (sources.length === 0) {
            return;
        }

        if (window.requestIdleCallback) {
            requestIdleCallback(loadChunk);
        } else {
            setTimeout(loadChunk, 0);
        }
    }

    loadStudyData();
    window.addEventListener('load', preloadFudaImages);
});
