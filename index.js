/****************************************************
 *
 * 0) SELECTORS
 *
 ****************************************************/

/* Модальное окно для информации */
const infoOverlay = document.getElementById('infoOverlay');
const closeInfoBtn = document.getElementById('closeInfoBtn');
const openInfoButtons = document.querySelectorAll('.open-info');

/* Элементы внутри модального окна */
const infoTitleEl = document.getElementById('infoTitle');
const infoTextEl = document.getElementById('infoText');
const infoMediaEl = document.getElementById('infoMedia');

/* Переключатель темы */
const themeToggle = document.getElementById('themeToggle');

/* Аватарка и её модальное окно */
const avatar = document.getElementById('avatar');
const avatarOverlay = document.getElementById('avatarOverlay');
const closeAvatarInfoBtn = document.getElementById('closeAvatarInfoBtn');

/* To store the last focused element */
let lastFocusedElement = null;

/****************************************************
 *
 * 1) MODAL OPEN/CLOSE FUNCTIONS
 *
 ****************************************************/

/**
 * Открывает модальное окно с заданным содержимым
 * @param {string} title - Заголовок модалки
 * @param {string} text - Текстовое содержание модалки
 * @param {Array} media - Массив объектов медиа (изображения/видео)
 * @param {HTMLElement} triggeringElement - Элемент, который открыл модалку
 */
function openModal(title = 'Без названия', text = 'Нет доступного текста.', media = [], triggeringElement) {
    lastFocusedElement = triggeringElement;

    // Заполнение текстового содержимого
    infoTitleEl.textContent = title;
    infoTextEl.textContent = text;

    // Очистка предыдущего медиа
    infoMediaEl.innerHTML = '';

    // Добавление медиа, если есть
    if (Array.isArray(media) && media.length > 0) {
        media.forEach(item => {
            if (item.type === 'image') {
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = item.alt || 'Изображение';
                img.loading = 'lazy';
                infoMediaEl.appendChild(img);
            } else if (item.type === 'video') {
                const iframe = document.createElement('iframe');
                iframe.src = item.src;
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                iframe.loading = 'lazy';
                iframe.style.width = '100%';
                iframe.style.height = '315px';
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
                infoMediaEl.appendChild(iframe);
            }
        });
    }

    // Показ модального окна
    infoOverlay.classList.add('active');
    document.body.classList.add('no-scroll');

    // Фокусировка на модалке для доступности
    infoOverlay.setAttribute('tabindex', '-1');
    infoOverlay.focus();

    // Добавление обработчиков событий для доступности
    document.addEventListener('keydown', handleKeydown);
    infoOverlay.addEventListener('keydown', trapFocusInModal);
}

/**
 * Закрывает модальное окно
 */
function closeModal() {
    infoOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    infoTitleEl.textContent = '';
    infoTextEl.textContent = '';
    infoMediaEl.innerHTML = '';
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }

    // Удаление обработчиков событий
    document.removeEventListener('keydown', handleKeydown);
    infoOverlay.removeEventListener('keydown', trapFocusInModal);
}

/**
 * Закрывает модальное окно при клике вне содержимого
 * @param {MouseEvent} e
 */
function handleOverlayClick(e) {
    if (e.target === infoOverlay) {
        closeModal();
    }
}

/****************************************************
 *
 * 2) EVENT HANDLERS
 *
 ****************************************************/

/**
 * Общий обработчик клавиатурных событий
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

/**
 * Ограничивает фокус внутри модального окна для доступности
 * @param {KeyboardEvent} e
 */
function trapFocusInModal(e) {
    if (e.key !== 'Tab') return;

    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input[type="text"]:not([disabled])',
        'input[type="radio"]:not([disabled])',
        'input[type="checkbox"]:not([disabled])',
        'select:not([disabled])'
    ];

    const focusableElements = infoOverlay.querySelectorAll(focusableSelectors.join(', '));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        // Tab
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

/****************************************************
 *
 * 3) ATTACHING EVENT LISTENERS (OPEN/CLOSE MODALS)
 *
 ****************************************************/

// Использование делегирования событий для открытия модальных окон
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-info');
    if (btn) {
        const title = btn.getAttribute('data-title');
        const text = btn.getAttribute('data-text');
        let media = [];
        try {
            media = JSON.parse(btn.getAttribute('data-media') || '[]');
        } catch (error) {
            console.error('Ошибка при парсинге media:', error);
        }
        openModal(title, text, media, btn);
    }
});

// Закрытие модального окна при клике на кнопку закрытия
closeInfoBtn.addEventListener('click', closeModal);

// Закрытие модального окна при клике вне содержимого
infoOverlay.addEventListener('click', handleOverlayClick);

/****************************************************
 *
 * 4) AVATAR MODAL FUNCTIONALITY
 *
 ****************************************************/

/**
 * Открывает модальное окно при клике на аватарку
 */
function openAvatarModal() {
    const title = avatarOverlay.querySelector('#avatarInfoTitle').textContent;
    const paragraphs = avatarOverlay.querySelectorAll('.info-modal p');
    const email = paragraphs[1] ? paragraphs[1].textContent : '';
    const location = paragraphs[2] ? paragraphs[2].textContent : '';
    const moreAboutMeBtn = avatarOverlay.querySelector('.open-info');

    // Собираем данные для модалки
    const modalTitle = title;
    const modalText = `${paragraphs[0].textContent}\n${email}\n${location}`;
    let modalMedia = [];
    if (moreAboutMeBtn) {
        try {
            modalMedia = JSON.parse(moreAboutMeBtn.getAttribute('data-media') || '[]');
        } catch (error) {
            console.error('Ошибка при парсинге modalMedia:', error);
        }
    }

    openModal(modalTitle, modalText, modalMedia, avatar);
}

// Открытие модального окна при клике на аватарку
avatar.addEventListener('click', openAvatarModal);

// Закрытие модального окна при клике на кнопку закрытия аватарки
closeAvatarInfoBtn.addEventListener('click', closeModal);

// Закрытие модального окна при клике вне содержимого аватарки
avatarOverlay.addEventListener('click', (e) => {
    if (e.target === avatarOverlay) {
        closeModal();
    }
});

/****************************************************
 *
 * 5) THEME TOGGLE WITH LOCALSTORAGE
 *
 ****************************************************/

// Получение сохранённой темы из localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';

// Инициализация темы на основе сохранённого значения
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.checked = true; // Устанавливаем состояние переключателя
} else {
    themeToggle.checked = false;
}

// Функция для переключения темы
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

// Добавление обработчика события для переключателя темы
themeToggle.addEventListener('change', toggleTheme);

/****************************************************
 *
 * 6) ADDITIONAL IMPROVEMENTS
 *
 ****************************************************/

/**
 * Улучшение доступности: добавление aria-attributes
 */
infoOverlay.setAttribute('aria-hidden', 'true');
infoOverlay.addEventListener('transitionend', () => {
    infoOverlay.setAttribute('aria-hidden', !infoOverlay.classList.contains('active'));
});


window.addEventListener('load', () => {
    // Плавное появление кнопок в sidebar
    const sidebarButtons = document.querySelectorAll('.cta-button-sidebar');
    sidebarButtons.forEach(button => {
        button.style.opacity = '1';
        button.style.transform = 'translateY(0)';
    });

    // Плавное появление социальных иконок
    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach(icon => {
        icon.style.opacity = '1';
        icon.style.transform = 'translateY(0)';
    });
});
