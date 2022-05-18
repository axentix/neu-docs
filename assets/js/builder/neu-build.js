const NeuAxentixBuilder = (() => {
  const neuClickElements = document.querySelectorAll('[data-neu-build-click]');
  const neuFocusElements = document.querySelectorAll('[data-neu-build-focus]');
  const neuClickedElements = document.querySelectorAll('[data-neu-build-clicked]');
  const neuHoverElements = document.querySelectorAll('[data-neu-build-hover]');
  const stateList = ['neu-build-bordered', 'neu-build-flat', 'neu-build-pressed', 'neu-build-concave', 'neu-build-convex'];

  /**
   * Toggle neu-clicked state
   */
  function _toggle(datasetName, e) {
    if (this.dataset[datasetName] && !stateList.includes(this.dataset[datasetName])) {
      console.error('Error: invalid classname in data-neu-build-...');
      return;
    }

    if (datasetName === 'neuBuildClick') {
      if (this.neuActive) {
        if (e.type === 'mousedown' || e.type === 'touchstart') {
          return;
        }
        this.neuActive = false;
      } else {
        if (e.type === 'mouseup' || e.type === 'mouseleave' || e.type === 'touchend' || e.type === 'touchmove') {
          return;
        }
        this.neuActive = true;
      }
    }

    if (datasetName === 'neuBuildHover') {
      if (!this.neuActive && e.type === 'mouseenter') {
        this.neuActive = true;
      } else if (!this.neuActive && e.type === 'mouseleave') {
        return;
      } else if (this.neuActive && e.type === 'mouseleave') {
        this.neuActive = false;
      }
    }

    const nextClass = this.dataset[datasetName];
    if (this.neuCurrClass) {
      this.classList.remove(this.neuCurrClass);
      this.dataset[datasetName] = this.neuCurrClass;
    } else {
      this.dataset[datasetName] = '';
    }

    if (nextClass) {
      this.classList.add(nextClass);
      this.neuCurrClass = nextClass;
    } else {
      this.neuCurrClass = '';
    }
  }

  /**
   * Setup neumorph classes
   */
  function _setupClasses(el) {
    let classList = el.className.split(' ');

    const neumorphClasses = classList.filter((className) => stateList.includes(className));
    if (neumorphClasses.length >= 2) {
      const newClasses = classList.filter((className) => !neumorphClasses.includes(className));
      newClasses.push(neumorphClasses[0]);
      el.className = newClasses.join(' ');
    }

    el.neuCurrClass = neumorphClasses[0] || '';
  }

  /**
   * Setup neu-click elements
   */
  function setup() {
    neuClickedElements.forEach((el) => {
      _setupClasses(el);
      el.toggleRef = _toggle.bind(el, 'neuBuildClicked');

      el.addEventListener('click', el.toggleRef);
    });

    neuClickElements.forEach((el) => {
      _setupClasses(el);
      el.toggleRef = _toggle.bind(el, 'neuBuildClick');

      el.addEventListener('mousedown', el.toggleRef);
      el.addEventListener('mouseleave', el.toggleRef);
      el.addEventListener('mouseup', el.toggleRef);

      if ('ontouchstart' in document.documentElement) {
        el.addEventListener('touchstart', el.toggleRef);
        el.addEventListener('touchend', el.toggleRef);
      }
    });

    neuFocusElements.forEach((el) => {
      _setupClasses(el);
      el.toggleRef = _toggle.bind(el, 'neuBuildFocus');

      el.addEventListener('focus', el.toggleRef);
      el.addEventListener('blur', el.toggleRef);
    });

    neuHoverElements.forEach((el) => {
      _setupClasses(el);
      el.toggleRef = _toggle.bind(el, 'neuBuildHover');

      el.addEventListener('mouseenter', el.toggleRef);
      el.addEventListener('mouseleave', el.toggleRef);
    });
  }

  return {
    setup,
  };
})();

NeuAxentixBuilder.setup();
