// Script für Navigation, Scroll-Effekte und Formulare.

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('menu-button');
  const navOverlay = document.getElementById('nav-overlay');
  const closeNav = document.getElementById('close-nav');

  // Öffnet das Overlay-Menü
  menuButton.addEventListener('click', () => {
    navOverlay.classList.add('open');
  });
  // Schließt das Overlay-Menü
  closeNav.addEventListener('click', () => {
    navOverlay.classList.remove('open');
  });
  // Schließt Menü beim Klicken eines Links
  navOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navOverlay.classList.remove('open');
      const contentTarget = link.getAttribute('data-target');
      if (contentTarget) {
        openInfoOverlay(contentTarget);
      }
    });
  });

  // Intersection Observer für Fade-in-Effekte
  const observerOptions = {
    threshold: 0.2,
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
  });

  // Info overlay elements
  const infoOverlay = document.getElementById('info-overlay');
  const infoContent = document.getElementById('info-content');
  const closeInfo = document.getElementById('close-info');
  const ringSvg = document.querySelector('.ring-svg');

  // Function to open the information overlay with given content
  function openInfoOverlay(contentId) {
    const contentEl = document.getElementById(contentId);
    if (contentEl) {
      // Reset ring animation: clear animation and offset
      if (ringSvg) {
        ringSvg.style.animation = 'none';
        ringSvg.style.strokeDashoffset = 600;
        // Force reflow to restart animation properly when class is added
        void ringSvg.offsetHeight;
      }
      // Insert the hidden content into the overlay
      infoContent.innerHTML = contentEl.innerHTML;
      infoOverlay.classList.add('open');
      // If the opened content is the chatbot, set up the chat functionality
      if (contentId === 'chatContent') {
        setupChatbot();
      }
    }
  }

  // Function to close overlay
  function closeInfoOverlay() {
    infoOverlay.classList.remove('open');
    // Remove any inserted content after closing to avoid memory leaks
    infoContent.innerHTML = '';
    // Reset the ring so that it draws again next time
    if (ringSvg) {
      ringSvg.style.animation = 'none';
      ringSvg.style.strokeDashoffset = 600;
    }
  }

  closeInfo.addEventListener('click', closeInfoOverlay);
  // Also close overlay when clicking outside the container
  infoOverlay.addEventListener('click', (e) => {
    if (e.target === infoOverlay) {
      closeInfoOverlay();
    }
  });

  /**
   * Setup the chatbot UI and interactions within the info overlay. Requires an OpenAI API key.
   * This function is called each time the chat overlay is opened because the DOM is re-rendered.
   */
  function setupChatbot() {
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    if (!chatWindow || !chatForm || !chatInput) return;
    // Clear previous messages
    chatWindow.innerHTML = '';
    const conversation = [];
    chatForm.onsubmit = async (event) => {
      event.preventDefault();
      const question = chatInput.value.trim();
      if (!question) return;
      addMessage('user', question);
      conversation.push({ role: 'user', content: question });
      chatInput.value = '';
      // Use API key from global variable if provided; fallback to placeholder
      const API_KEY = window.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
      const payload = {
        model: 'gpt-3.5-turbo',
        messages: conversation,
        max_tokens: 150,
        temperature: 0.7,
      };
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        const answer = data.choices && data.choices[0] && data.choices[0].message.content.trim();
        if (answer) {
          addMessage('bot', answer);
          conversation.push({ role: 'assistant', content: answer });
        } else {
          addMessage('bot', 'Die Antwort konnte nicht geladen werden. Bitte versuchen Sie es erneut.');
        }
      } catch (err) {
        addMessage('bot', 'Fehler beim Abrufen der Antwort. Bitte API‑Key prüfen.');
      }
    };
    function addMessage(sender, text) {
      const msg = document.createElement('div');
      msg.classList.add('message', sender);
      msg.textContent = text;
      chatWindow.appendChild(msg);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }



  // Interaktive, organische Formen konfigurieren
  const shapes = document.querySelectorAll('.shape');
  // Assign roles to shapes: one for chat, one for showing facts, one for playful interaction
  // We use only a chat bubble and two playful bubbles. The roles for
  // "risk" and "facts" have been removed.
  const roles = ['chat', 'playful', 'playful'];
  const palette = [
    'var(--color-blue)',
    'var(--color-petrol)',
    'var(--color-purple)',
    'var(--color-neon)',
    '#09fbd3',
    '#00d4ff',
    '#16a2cc',
    '#883aff',
    '#ff00ff', /* neon magenta */
    '#00ffea', /* neon aqua */
    '#ffea00', /* neon yellow */
    '#ff0080'  /* neon pink */
  ];

  // Utility functions for random values
  const randomValue = (min, max) => Math.random() * (max - min) + min;
  const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);

  /**
   * Assign initial target section and set up click behaviour
   */
  shapes.forEach((shape, index) => {
    // Assign role to this shape
    const role = roles[index % roles.length];
    shape.dataset.role = role;
    // Determine hidden content target for chat and fact roles
    if (role === 'chat') {
      shape.dataset.target = 'chatContent';
    } else if (role === 'fact') {
      shape.dataset.target = 'factsContent';
    }
    shape.dataset.expanded = 'false';
    shape.addEventListener('click', (e) => {
      e.stopPropagation();
      openBubble(shape);
    });
    /*
     * Delay the initial appearance of each shape for a staggered effect.
     * Use shorter delays (1–2s per shape) to have the bubbles appear earlier.
     */
    const baseDelay = (index + 1) * 1000;
    const randomOffset = Math.random() * 1000;
    const initialDelay = baseDelay + randomOffset;
    setTimeout(() => {
      // Fade in the shape and start its animation
      shape.style.opacity = '0.7';
      animateShape(shape);
    }, initialDelay);
  });

  // Track which bubble is currently expanded
  let expandedShape = null;

  /**
   * Handles bubble click: delegates behaviour based on the shape's role.
   * @param {HTMLElement} shape
   */
  function openBubble(shape) {
    const role = shape.dataset.role;
    // Collapse if this bubble is already expanded
    if (shape.dataset.expanded === 'true') {
      collapseShape(shape);
      return;
    }
    // Collapse any other expanded bubble
    if (expandedShape && expandedShape !== shape) {
      collapseShape(expandedShape);
    }
    if (role === 'chat') {
      playSound();
      expandShape(shape);
    } else {
      // Playful bubbles simply change colour/shape and play a sound
      playSound();
      playfulInteraction(shape);
    }
  }

  /**
   * Expands a bubble: enlarge it, insert content, and set up interactions.
   * @param {HTMLElement} shape
   */
  function expandShape(shape) {
    shape.dataset.expanded = 'true';
    expandedShape = shape;
    // Elevate shape above others
    shape.style.zIndex = '10';
    // Apply inline styles to override prior transforms from animateShape
    shape.style.width = '60vmin';
    shape.style.height = '60vmin';
    shape.style.top = '50vh';
    shape.style.left = '50vw';
    shape.style.transform = 'translate(-50%, -50%)';
    // Ensure the bubble has a dark background and normal blend mode
    shape.style.backgroundColor = 'rgba(10, 20, 40, 0.95)';
    shape.style.mixBlendMode = 'normal';
    shape.classList.add('expanded');
    // Insert a close button and content
    const targetId = shape.dataset.target;
    const contentEl = document.getElementById(targetId);
    if (contentEl) {
      // Populate shape with close button and a container for the content
      shape.innerHTML = `<button class="close-bubble">×</button><div class="bubble-content">${contentEl.innerHTML}</div>`;
      // Set up close handler
      const closeBtn = shape.querySelector('.close-bubble');
      closeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        collapseShape(shape);
      });
      // After injecting content, initialise any dynamic behaviour
      if (targetId === 'chatContent') {
        setupChatbot();
      }
    }
  }

  /**
   * Expands a bubble to display a single fact. The bubble can cycle facts via a button.
   * @param {HTMLElement} shape
   */
  // removed expandFactBubble; fact bubbles no longer used

  /**
   * Handles playful interactions for bubbles: random colour change, shape change or temporary vanish.
   * @param {HTMLElement} shape
   */
  function playfulInteraction(shape) {
    const effect = Math.floor(Math.random() * 3);
    if (effect === 0) {
      // Colour change
      const newColor = palette[Math.floor(Math.random() * palette.length)];
      shape.style.backgroundColor = newColor;
      checkNeonAccent();
    } else if (effect === 1) {
      // Shape change
      animateShape(shape);
    } else {
      // Vanish: fade out and return
      shape.style.opacity = '0';
      setTimeout(() => {
        animateShape(shape);
        setTimeout(() => {
          shape.style.opacity = '0.7';
          checkNeonAccent();
        }, 50);
      }, 2000);
    }
  }

  /**
   * Returns a random fact from the fact list.
   */
  // getRandomFact removed – facts/prompts feature deprecated

  /**
   * Collapses an expanded bubble: remove inserted content and resume animation.
   * @param {HTMLElement} shape
   */
  function collapseShape(shape) {
    shape.dataset.expanded = 'false';
    shape.classList.remove('expanded');
    shape.style.zIndex = '';
    // Remove any inline positioning and sizing set during expansion
    shape.style.width = '';
    shape.style.height = '';
    shape.style.top = '';
    shape.style.left = '';
    shape.style.transform = '';
    shape.style.backgroundColor = '';
    shape.style.mixBlendMode = '';
    // Clear content
    shape.innerHTML = '';
    // Restart animation from scratch
    animateShape(shape);
    // Remove reference to expanded shape
    expandedShape = null;
  }

  /**
   * Recursively animate a shape: randomise position, size, rotation, border radius and colour.
   * Also handles fading out and back in at random intervals to simulate disappearance.
   * @param {HTMLElement} shape
   */
  function animateShape(shape) {
    // If the bubble is expanded, skip animation cycles until it is collapsed.
    if (shape.dataset && shape.dataset.expanded === 'true') {
      return;
    }
    // Random width and height separately to create a variety of shapes.
    // We allow a wider range to create larger and smaller blobs. Using 10–50vmin
    // introduces more variety and increases the chance of overlap. The ratio
    // between width and height varies independently, so some forms will be long
    // and others squat.
    const width = randomValue(10, 50);
    const height = randomValue(10, 50);
    shape.style.width = width + 'vmin';
    shape.style.height = height + 'vmin';

    // Random position: allow shapes to wander slightly outside the hero to create surprise
    const topPercent = randomValue(-20, 80);
    const leftPercent = randomValue(-20, 80);
    shape.style.top = topPercent + 'vh';
    shape.style.left = leftPercent + 'vw';

    // Random rotation and scale
    const rotation = randomValue(0, 360);
    const scale = randomValue(0.7, 1.6);
    shape.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    // Random colour from palette
    const newColor = palette[Math.floor(Math.random() * palette.length)];
    shape.style.backgroundColor = newColor;

    // Random organic border radius. To avoid cylindrical shapes, we assign
    // independent horizontal and vertical radii across a broader spectrum. The
    // variation between corners yields more amorphous silhouettes.
    const hr0 = rand(20, 80);
    const hr1 = rand(20, 80);
    const hr2 = rand(20, 80);
    const hr3 = rand(20, 80);
    const vr0 = rand(20, 80);
    const vr1 = rand(20, 80);
    const vr2 = rand(20, 80);
    const vr3 = rand(20, 80);
    shape.style.borderRadius = `${hr0}% ${hr1}% ${hr2}% ${hr3}% / ${vr0}% ${vr1}% ${vr2}% ${vr3}%`;

    // Determine how long before the next cycle begins (8–18 seconds)
    const cycleDuration = randomValue(8, 18) * 1000;

    // At 85% of the duration, fade out the shape, then trigger next animation
    setTimeout(() => {
      // Begin a slow fade-out
      shape.style.opacity = '0';
      // After the fade-out completes (approx. 3s), reposition and fade in
      setTimeout(() => {
        animateShape(shape);
        // Reset opacity back to original after slight delay to allow new transform to apply
        setTimeout(() => {
          shape.style.opacity = '0.7';
          // Ensure at least one shape glows neon
          checkNeonAccent();
        }, 50);
      }, 3000);
    }, cycleDuration * 0.85);
  }

  /**
   * Ensure that at least one shape on the page has a neon colour. If none currently does,
   * randomly assign a neon colour to one of the shapes. Neon colours are defined as a
   * subset of the palette.
   */
  function checkNeonAccent() {
    const neonColors = [
      '#39ff14',
      '#09fbd3',
      '#00ffea',
      '#ff00ff',
      '#ffea00',
      '#ff0080'
    ];
    const hasNeon = Array.from(shapes).some(shape => {
      const color = shape.style.backgroundColor.replace(/\s/g, '').toLowerCase();
      return neonColors.some(neon => neon.toLowerCase() === color);
    });
    if (!hasNeon) {
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      const neon = neonColors[Math.floor(Math.random() * neonColors.length)];
      randomShape.style.backgroundColor = neon;
    }
  }

  // Perform an initial neon check so that on page load one bubble glows
  checkNeonAccent();

  /**
   * Floating chat widget: drifts across the screen. When clicked, it stops moving
   * and allows the user to type a question. Answers are appended below. The
   * chat uses the same OpenAI API as the chat overlay. A conversation is
   * persisted within the widget.
   */
  const floatingChat = document.getElementById('floating-chat');
  const floatingChatForm = document.getElementById('floating-chat-form');
  const floatingChatInput = document.getElementById('floating-chat-input');
  const floatingChatMessages = document.getElementById('floating-chat-messages');
  let chatMoving = true;
  let chatTimeout;
  const chatConversation = [];

  // Animate the floating chat to random positions at varying intervals
  function animateFloatingChat() {
    if (!chatMoving) return;
    const topPercent = randomValue(10, 70);
    const leftPercent = randomValue(10, 70);
    floatingChat.style.top = topPercent + 'vh';
    floatingChat.style.left = leftPercent + 'vw';
    const duration = randomValue(8, 15) * 1000;
    chatTimeout = setTimeout(animateFloatingChat, duration);
  }
  // Start the chat movement shortly after page load
  setTimeout(animateFloatingChat, 1500);
  // When the chat is clicked, stop its movement so the user can interact
  floatingChat.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (chatMoving) {
      chatMoving = false;
      clearTimeout(chatTimeout);
    }
  });
  // Handle chat submission inside floating chat
  if (floatingChatForm) {
    floatingChatForm.onsubmit = async (event) => {
      event.preventDefault();
      const question = floatingChatInput.value.trim();
      if (!question) return;
      addFloatingMessage('user', question);
      chatConversation.push({ role: 'user', content: question });
      floatingChatInput.value = '';
      // Use API key from global variable if provided; fallback to placeholder
      const API_KEY = window.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
      const payload = {
        model: 'gpt-3.5-turbo',
        messages: chatConversation,
        max_tokens: 150,
        temperature: 0.7,
      };
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        const answer = data.choices && data.choices[0] && data.choices[0].message.content.trim();
        if (answer) {
          addFloatingMessage('bot', answer);
          chatConversation.push({ role: 'assistant', content: answer });
        } else {
          addFloatingMessage('bot', 'Die Antwort konnte nicht geladen werden. Bitte versuchen Sie es erneut.');
        }
      } catch (err) {
        addFloatingMessage('bot', 'Fehler beim Abrufen der Antwort. Bitte API‑Key prüfen.');
      }
    };
  }
  function addFloatingMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    floatingChatMessages.appendChild(msg);
    floatingChatMessages.scrollTop = floatingChatMessages.scrollHeight;
  }

  /**
   * Simple sound effect using Web Audio API. Plays a short sine tone when a
   * bubble expands. Sound is intentionally subtle so that it enhances rather
   * than distracts. See the importance of purposeful motion and sensory
   * feedback in modern web design【956564555466541†L120-L146】.
   */
  function playSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
  }
});