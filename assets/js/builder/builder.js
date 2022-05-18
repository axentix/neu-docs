import { httpService } from './http-service';
import iro from './iro';
import { NeuPreview } from './neu-preview';
import './neu-build';

const colorTab = new Axentix.Tab('#color-tab', {
  animationType: 'slide',
  caroulix: {
    height: '17rem',
  },
});

const importModal = new Axentix.Modal('#import-modal');

const toast = new Axentix.Toast('', {
  isClosable: true,
  offset: {
    y: '80px',
  },
});

const NeuDownload = (() => {
  const colorPicker = iro.ColorPicker('#color-picker', {
    color: '#2196f3',
    width: 180,
    layoutDirection: 'horizontal',
    display: 'flex',
  });

  let colors = [];

  const downloadEl = document.querySelector('#download'),
    previewEl = document.querySelector('.builder-preview'),
    colorBtn = document.querySelector('#add-color-btn'),
    colorPaletteBtn = document.querySelector('#add-color-palette-btn'),
    paletteColors = document.querySelector('#paletteColors'),
    colorPreviewInput = document.querySelector('#color-preview'),
    colorList = downloadEl.querySelector('.color-list'),
    suffixInput = downloadEl.querySelector('#suffix'),
    minifyCheckbox = downloadEl.querySelector('#minify'),
    filenameSuffix = downloadEl.querySelector('#filename-suffix'),
    filenameExtension = downloadEl.querySelector('#filename-extension'),
    downloadBtn = downloadEl.querySelector('#download-btn'),
    downloadThemeBtn = downloadEl.querySelector('#download-theme-btn'),
    themeInput = document.querySelector('#theme-input'),
    importThemeBtn = document.querySelector('#import-theme-btn');

  let isWaiting = false,
    token = '';

  function setup() {
    suffixInput.addEventListener('input', handleInput);
    minifyCheckbox.addEventListener('change', handleCheckbox);
    downloadBtn.addEventListener('click', makeRequest);
    colorBtn.addEventListener('click', addColorByPicker);
    colorPaletteBtn.addEventListener('click', addColorByPicker);
    paletteColors.addEventListener('click', addColorByPalette);
    downloadThemeBtn.addEventListener('click', downloadTheme);
    importThemeBtn.addEventListener('click', importTheme);

    colorPreviewInput.addEventListener('change', handleColorPreviewInput);
    colorPicker.on('color:change', handleColorPickerChange);

    setShadowsProperties(colorPicker.color.hexString);
  }

  function handleInput() {
    filenameSuffix.innerHTML = suffixInput.value;
  }

  function handleCheckbox() {
    if (minifyCheckbox.checked) {
      filenameExtension.innerHTML = '.min.css';
    } else {
      filenameExtension.innerHTML = '.css';
    }
  }

  function handleColorPickerChange(color) {
    colorPreviewInput.value = color.hexString;
    setShadowsProperties(color.hexString);
  }

  function handleColorPreviewInput() {
    colorPicker.color.hexString = colorPreviewInput.value;
  }

  function setShadowsProperties(color) {
    previewEl.style.setProperty('--neu-build-bg', color);
    previewEl.style.setProperty('--neu-build-txt', NeuPreview.txtColor(color));
    previewEl.style.setProperty('--neu-build-dk8', NeuPreview.lightenDarkenColor(color, -8));
    previewEl.style.setProperty('--neu-build-dk6', NeuPreview.lightenDarkenColor(color, -6));
    previewEl.style.setProperty('--neu-build-lt8', NeuPreview.lightenDarkenColor(color, 8));
    previewEl.style.setProperty('--neu-build-lt7', NeuPreview.lightenDarkenColor(color, 7));
    previewEl.style.setProperty('--neu-build-lt6', NeuPreview.lightenDarkenColor(color, 6));
  }

  function addColorByPicker(e) {
    e.preventDefault();
    const color = colorPicker.color.hexString;
    addColor(color);
  }

  function addColorByPalette(e) {
    e.preventDefault();
    const style = getComputedStyle(e.target);
    colorPicker.color.rgbString = style.backgroundColor;
  }

  function addColor(color, name = '') {
    if (colors.includes(color)) {
      toast.change('Color ' + color + ' already selected.', {
        classes: 'rounded-2 error',
      });
      toast.show();
      return;
    }

    colors.push(color);
    let colorDiv = document.createElement('div');
    colorDiv.className = 'form-field form-default form-inline';
    colorDiv.innerHTML = `
    <label for="${color}" style="background-color: ${color};"></label>
    .neu-<input type="text" required class="form-control ml-1 neu-pressed rounded-1" id="${color}" name="${name}" value="${name}" placeholder="classname">
    <div class="close"><i class="fas fa-times"></i></div>
    `;
    const input = colorDiv.querySelector('input');
    input.updateRef = updateColorName.bind(input);
    input.addEventListener('input', input.updateRef);

    const close = colorDiv.querySelector('.close');
    close.closeRef = removeColor.bind(close);
    close.addEventListener('click', close.closeRef);
    colorList.appendChild(colorDiv);
  }

  function removeColor() {
    const color = this.id;
    colors.splice(colors.indexOf(color), 1);
    const input = this.parentNode.querySelector('input');
    input.removeEventListener('input', input.updateRef);
    input.updateRef = undefined;
    this.removeEventListener('click', this.closeRef);
    this.closeRef = undefined;
    this.parentNode.remove();
  }

  function updateColorName() {
    this.name = this.value;
  }

  function formatColors() {
    let error = false;
    const tmpColors = colors.reduce((acc, color) => {
      const name = document.getElementById(color).name;
      name ? (acc[name] = color) : (error = true);
      return acc;
    }, {});

    return error ? false : tmpColors;
  }

  function saveBlob(blob, fileName) {
    const a = document.createElement('a');
    const URL = window.URL || window.webkitURL;
    const downloadUrl = URL.createObjectURL(blob);
    if (typeof a.download === 'undefined') {
      window.location = downloadUrl;
    } else {
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
    }
  }

  function check(colorsFormatted) {
    if (!colorsFormatted) {
      toast.change('All fields are required.', {
        classes: 'rounded-2 error',
      });
      return false;
    } else if (Object.keys(colorsFormatted).length === 0 && colorsFormatted.constructor === Object) {
      toast.change('Select 1 or more colors.', {
        classes: 'rounded-2 error',
      });
      return false;
    }
    return true;
  }

  /**
   * @param {Event} e
   */
  async function makeRequest(e) {
    e.preventDefault();
    if (isWaiting) {
      return;
    }
    isWaiting = true;

    const colorsFormatted = formatColors();
    if (!check(colorsFormatted)) {
      isWaiting = false;
      toast.show();
      return;
    }
    downloadEl.classList.add('load');

    const url = 'https://neu-api.useaxentix.com/builder/generate';
    const body = {
      isMinified: minifyCheckbox.checked,
      suffix: suffixInput.value,
      colors: colorsFormatted,
      'g-recaptcha-response': token,
    };

    try {
      const resp = await httpService.post(url, JSON.stringify(body));
      if (resp.blob && resp.fileName) {
        saveBlob(resp.blob, resp.fileName);
      }
    } catch (error) {
      // console.error(error);
      if (error.errors && error.errors.some((val) => !val.value && val.param === 'g-recaptcha-response')) {
        toast.change('Captcha required, please try again.', {
          classes: 'rounded-2 error',
        });
      } else {
        toast.change('An error occured.', {
          classes: 'rounded-2 error',
        });
      }
      toast.show();
    }

    grecaptcha.reset();
    downloadEl.classList.remove('load');
    isWaiting = false;
  }

  function handleCaptcha(res) {
    token = res;
  }

  function expiredCaptcha() {
    token = '';
  }

  function downloadTheme(e) {
    e.preventDefault();

    const colorsFormatted = formatColors();
    if (!check(colorsFormatted)) {
      isWaiting = false;
      toast.show();
      return;
    }

    colorsFormatted['neu-suffix'] = suffixInput.value;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(colorsFormatted));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `neu-axentix-${suffixInput.value}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function importTheme(e) {
    e.preventDefault();
    const file = themeInput.files[0];

    if (file.type !== 'application/json') {
      return;
    }

    try {
      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        const json = JSON.parse(event.target.result);
        Object.keys(json).map((name) => {
          if (name === 'neu-suffix') {
            suffixInput.value = json[name];
            filenameSuffix.innerHTML = json[name];
          } else {
            addColor(json[name], name);
          }
        });
        importModal.close();
      });

      reader.readAsText(file);
    } catch (error) {
      console.log(error);
    }
  }

  return {
    setup,
    handleCaptcha,
    expiredCaptcha,
  };
})();

NeuDownload.setup();

window.handleCaptcha = NeuDownload.handleCaptcha;
window.expiredCaptcha = NeuDownload.expiredCaptcha;
