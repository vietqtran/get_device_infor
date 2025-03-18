/**
 * Fingerprinting toàn diện cho trình duyệt và thiết bị
 */
class BrowserFingerprint {
  constructor() {
    this.fingerprint = {};
  }

  async collectAll() {
    try {
      // Thu thập tất cả dữ liệu fingerprintable
      await Promise.all([
        this.collectBasicInfo(),
        this.collectScreenInfo(),
        this.collectHardwareInfo(),
        this.collectTimeInfo(),
        this.collectBrowserInfo(),
        this.collectCanvasFingerprint(),
        this.collectWebGLInfo(),
        this.collectFonts(),
        this.collectAudioInfo(),
        this.collectNetworkInfo(),
        this.collectStorageInfo(),
        this.collectBatteryInfo(),
        this.collectMediaInfo(),
        this.collectSensors(),
        this.collectNavigatorProps(),
        this.collectPermissions(),
        this.collectBehaviorData()
      ]);

      // Tính toán ID ngẫu nhiên (có thể thay thế bằng thuật toán phức tạp hơn)
      this.fingerprint.fingerprintId = this.generateFingerprintHash();
      
      return this.fingerprint;
    } catch (error) {
      console.error("Lỗi khi thu thập fingerprint:", error);
      return { error: error.message };
    }
  }

  // Thu thập thông tin cơ bản
  async collectBasicInfo() {
    this.fingerprint.userAgent = navigator.userAgent;
    this.fingerprint.platform = navigator.platform;
    this.fingerprint.cpuClass = navigator.cpuClass || 'Không khả dụng';
    this.fingerprint.doNotTrack = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack || 'Không khả dụng';
    this.fingerprint.languages = navigator.languages || [navigator.language || navigator.userLanguage];
    this.fingerprint.oscpu = navigator.oscpu || 'Không khả dụng';
    this.fingerprint.vendor = navigator.vendor || 'Không khả dụng';
    this.fingerprint.vendorSub = navigator.vendorSub || 'Không khả dụng';
    this.fingerprint.productSub = navigator.productSub || 'Không khả dụng';
    this.fingerprint.cookieEnabled = navigator.cookieEnabled;
    this.fingerprint.appName = navigator.appName || 'Không khả dụng';
    this.fingerprint.appVersion = navigator.appVersion || 'Không khả dụng';
    this.fingerprint.appCodeName = navigator.appCodeName || 'Không khả dụng';
    this.fingerprint.buildID = navigator.buildID || 'Không khả dụng';
    this.fingerprint.product = navigator.product || 'Không khả dụng';
    this.fingerprint.userAgentData = this.getUserAgentData();
  }

  // Thu thập thông tin hiện đại từ userAgentData
  getUserAgentData() {
    if (!navigator.userAgentData) return 'Không khả dụng';
    
    const uaData = {
      brands: navigator.userAgentData.brands,
      mobile: navigator.userAgentData.mobile
    };
    
    if (navigator.userAgentData.getHighEntropyValues) {
      // Yêu cầu thông tin chi tiết (có thể cần người dùng chấp nhận)
      navigator.userAgentData.getHighEntropyValues([
        "architecture",
        "bitness", 
        "model",
        "platformVersion", 
        "fullVersionList"
      ]).then(highEntropyValues => {
        Object.assign(uaData, highEntropyValues);
      }).catch(e => {
        console.log("Không thể lấy high entropy values:", e);
      });
    }
    
    return uaData;
  }

  // Thu thập thông tin màn hình
  async collectScreenInfo() {
    const screen = window.screen || {};
    
    this.fingerprint.screen = {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation: screen.orientation ? {
        type: screen.orientation.type,
        angle: screen.orientation.angle
      } : 'Không khả dụng',
      devicePixelRatio: window.devicePixelRatio,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight
    };
    
    // Media queries để phát hiện tính năng
    this.fingerprint.mediaFeatures = {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      lightMode: window.matchMedia('(prefers-color-scheme: light)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hoverAvailable: window.matchMedia('(hover: hover)').matches,
      finePointer: window.matchMedia('(pointer: fine)').matches,
      colorGamut: this.detectColorGamut(),
      invertedColors: window.matchMedia('(inverted-colors: inverted)').matches,
      contrastLevel: this.detectContrast()
    };
  }

  // Phát hiện gamut màu
  detectColorGamut() {
    if (window.matchMedia('(color-gamut: rec2020)').matches) {
      return 'rec2020';
    } else if (window.matchMedia('(color-gamut: p3)').matches) {
      return 'p3';
    } else if (window.matchMedia('(color-gamut: srgb)').matches) {
      return 'srgb';
    } else {
      return 'unknown';
    }
  }

  // Phát hiện tương phản
  detectContrast() {
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      return 'more';
    } else if (window.matchMedia('(prefers-contrast: less)').matches) {
      return 'less';
    } else if (window.matchMedia('(prefers-contrast: custom)').matches) {
      return 'custom';
    } else {
      return 'normal';
    }
  }

  // Thu thập thông tin phần cứng
  async collectHardwareInfo() {
    this.fingerprint.hardware = {
      deviceMemory: navigator.deviceMemory || 'Không khả dụng',
      hardwareConcurrency: navigator.hardwareConcurrency || 'Không khả dụng',
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
    
    // Phát hiện tính năng phần cứng
    this.fingerprint.hardwareCapabilities = {
      bluetooth: 'bluetooth' in navigator,
      usb: 'usb' in navigator,
      serial: 'serial' in navigator,
      nfc: 'nfc' in navigator,
      hid: 'hid' in navigator,
      gamepads: 'getGamepads' in navigator,
      virtualReality: 'xr' in navigator
    };
  }

  // Thu thập thông tin múi giờ
  async collectTimeInfo() {
    const date = new Date();
    this.fingerprint.time = {
      timezoneOffset: date.getTimezoneOffset(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localeDateTime: date.toLocaleString(),
      resolvedLocale: Intl.DateTimeFormat().resolvedOptions().locale,
      dateTimeFormat: {
        dateStyle: Intl.DateTimeFormat(undefined, {dateStyle: 'full'}).format(date),
        timeStyle: Intl.DateTimeFormat(undefined, {timeStyle: 'full'}).format(date)
      }
    };
    
    // Performance timing
    if (window.performance) {
      this.fingerprint.time.performanceTiming = {
        navigationStart: window.performance.timing ? window.performance.timing.navigationStart : 'Không khả dụng',
        timeOrigin: window.performance.timeOrigin || 'Không khả dụng',
        now: window.performance.now()
      };
    }
  }

  // Thu thập thông tin trình duyệt
  async collectBrowserInfo() {
    this.fingerprint.browser = {
      plugins: this.getPlugins(),
      mimeTypes: this.getMimeTypes(),
      pdfViewerEnabled: this.checkPdfViewerEnabled(),
      touchSupport: this.getTouchSupport(),
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
      mathMLEnabled: this.checkMathML(),
      webSocketEnabled: 'WebSocket' in window,
      webWorkersEnabled: 'Worker' in window,
      webAssemblyEnabled: 'WebAssembly' in window,
      sharedWorkersEnabled: 'SharedWorker' in window,
      serviceWorkersEnabled: 'serviceWorker' in navigator,
      webRTCEnabled: this.checkWebRTC(),
      webAuthnEnabled: 'credentials' in navigator && 'PublicKeyCredential' in window,
      speechSynthesisEnabled: 'speechSynthesis' in window,
      speechRecognitionEnabled: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
      clipboard: {
        readTextEnabled: navigator.clipboard && 'readText' in navigator.clipboard,
        writeTextEnabled: navigator.clipboard && 'writeText' in navigator.clipboard,
        readEnabled: navigator.clipboard && 'read' in navigator.clipboard,
        writeEnabled: navigator.clipboard && 'write' in navigator.clipboard
      },
      indexedDB: 'indexedDB' in window,
      webSQL: 'openDatabase' in window,
      DOMStorage: 'localStorage' in window && 'sessionStorage' in window,
      cookiesEnabled: navigator.cookieEnabled,
      colorManagementEnabled: window.matchMedia && window.matchMedia('(color-gamut: p3)').matches,
      // Kiểm tra các tính năng mới của trình duyệt
      modernFeatures: this.checkModernFeatures()
    };
  }

  // Lấy danh sách plugins
  getPlugins() {
    if (!navigator.plugins || navigator.plugins.length === 0) {
      return 'Không khả dụng';
    }
    
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];
      const pluginInfo = {
        name: plugin.name,
        description: plugin.description,
        filename: plugin.filename,
        version: plugin.version,
        mimeTypes: []
      };
      
      for (let j = 0; j < plugin.length; j++) {
        pluginInfo.mimeTypes.push({
          type: plugin[j].type,
          description: plugin[j].description,
          suffixes: plugin[j].suffixes
        });
      }
      
      plugins.push(pluginInfo);
    }
    
    return plugins;
  }

  // Lấy danh sách MIME types
  getMimeTypes() {
    if (!navigator.mimeTypes || navigator.mimeTypes.length === 0) {
      return 'Không khả dụng';
    }
    
    const mimeTypes = [];
    for (let i = 0; i < navigator.mimeTypes.length; i++) {
      const mt = navigator.mimeTypes[i];
      mimeTypes.push({
        type: mt.type,
        description: mt.description,
        suffixes: mt.suffixes,
        enabledPlugin: mt.enabledPlugin ? mt.enabledPlugin.name : null
      });
    }
    
    return mimeTypes;
  }

  // Kiểm tra PDF viewer
  checkPdfViewerEnabled() {
    return navigator.pdfViewerEnabled !== undefined ? 
      navigator.pdfViewerEnabled : 
      (navigator.mimeTypes && navigator.mimeTypes['application/pdf'] ? true : false);
  }

  // Lấy thông tin về touch support
  getTouchSupport() {
    let maxTouchPoints = 0;
    let touchEvent = false;
    let touchPoints = 0;
    
    if (navigator.maxTouchPoints !== undefined) {
      maxTouchPoints = navigator.maxTouchPoints;
    }
    
    touchEvent = 'ontouchstart' in window;
    
    if (window.TouchEvent) {
      touchPoints = maxTouchPoints;
    }
    
    return {
      maxTouchPoints,
      touchEvent,
      touchPoints
    };
  }

  // Kiểm tra MathML
  checkMathML() {
    const div = document.createElement('div');
    div.innerHTML = '<math><mrow><mi>x</mi></mrow></math>';
    return div.firstChild && 'MathMLElement' in window ? 
      div.firstChild instanceof window.MathMLElement : false;
  }

  // Kiểm tra WebRTC
  checkWebRTC() {
    return (
      window.RTCPeerConnection || 
      window.webkitRTCPeerConnection || 
      window.mozRTCPeerConnection
    ) ? true : false;
  }

  // Kiểm tra các tính năng hiện đại của trình duyệt
  checkModernFeatures() {
    return {
      webGPU: 'gpu' in navigator,
      webTransport: 'WebTransport' in window,
      webCodecs: 'VideoEncoder' in window && 'VideoDecoder' in window,
      webHID: 'hid' in navigator,
      webUSB: 'usb' in navigator,
      webMIDI: 'requestMIDIAccess' in navigator,
      webBluetooth: 'bluetooth' in navigator,
      webNFC: 'NDEFReader' in window,
      webSerial: 'serial' in navigator,
      offscreenCanvas: 'OffscreenCanvas' in window,
      webAnimation: 'Animation' in window,
      webShare: 'share' in navigator,
      payments: 'PaymentRequest' in window,
      credentialManagement: 'credentials' in navigator,
      webVR: 'getVRDisplays' in navigator,
      webXR: 'xr' in navigator,
      sharedArrayBuffer: 'SharedArrayBuffer' in window,
      backgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window,
      periodicSync: 'serviceWorker' in navigator && 'PeriodicSyncManager' in window,
      webLocks: 'locks' in navigator,
      idle: 'IdleDetector' in window,
      contentIndex: 'serviceWorker' in navigator && 'ContentIndex' in window,
      layoutInstability: 'LayoutShift' in window,
      eyeDropper: 'EyeDropper' in window,
      fileSystem: 'showOpenFilePicker' in window
    };
  }

  // Canvas fingerprinting
  async collectCanvasFingerprint() {
    this.fingerprint.canvas = {
      standard: this.getCanvasFingerprint(),
      text: this.getTextFingerprint(),
      webgl: this.getWebGLFingerprint(),
      uniqueValues: this.getCanvasUniqueValues()
    };
  }

  // Canvas cơ bản
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'Canvas context không khả dụng';
      
      // Vẽ gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(0.5, 'green');
      gradient.addColorStop(1, 'blue');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Vẽ văn bản
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('Canvas Fingerprint', 10, 30);
      
      // Vẽ một số hình dạng
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(180, 25, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      return this.hashString(canvas.toDataURL());
    } catch (e) {
      return 'Lỗi: ' + e.message;
    }
  }

  // Text rendering fingerprint
  getTextFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 650;
      canvas.height = 100;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'Canvas context không khả dụng';
      
      const testString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~1!2@3#4$5%6^7&8*9(0)-_=+[{]}\\|;:\'",<.>/?';
      const fonts = [
        'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana',
        'Tahoma', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'serif', 'sans-serif', 'monospace'
      ];
      
      let y = 10;
      for (let font of fonts) {
        ctx.font = `14px ${font}`;
        ctx.fillText(testString, 5, y);
        y += 20;
      }
      
      return this.hashString(canvas.toDataURL());
    } catch (e) {
      return 'Lỗi: ' + e.message;
    }
  }

  // WebGL fingerprint
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'WebGL không khả dụng';

      // Vẽ tam giác đỏ
      canvas.width = 100;
      canvas.height = 100;
      
      // Vertex shader
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `);
      gl.compileShader(vertexShader);
      
      // Fragment shader
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, `
        precision mediump float;
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
      `);
      gl.compileShader(fragmentShader);
      
      // Program
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);
      
      // Buffers
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -0.5, -0.5,
         0.5, -0.5,
         0.0,  0.5
      ]), gl.STATIC_DRAW);
      
      // Attributes
      const positionLocation = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Draw
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      
      return this.hashString(canvas.toDataURL());
    } catch (e) {
      return 'Lỗi: ' + e.message;
    }
  }

  // Canvas unique values
  getCanvasUniqueValues() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'Canvas context không khả dụng';
      
      // Test các giá trị nhỏ, sắc thái tinh tế
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(0, 0, 1, 1);
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.fillRect(2, 0, 1, 1);
      
      ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
      ctx.fillRect(4, 0, 1, 1);
      
      // Test chính xác số học dấu phẩy động
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(${i*25}, ${i*15}, ${i*5}, 0.1)`;
        ctx.fillRect(i, 5, 1, 1);
      }
      
      return this.hashString(canvas.toDataURL());
    } catch (e) {
      return 'Lỗi: ' + e.message;
    }
  }

  // Thu thập thông tin WebGL
  async collectWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        this.fingerprint.webgl = { available: false };
        return;
      }
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const webgl2 = !!document.createElement('canvas').getContext('webgl2');
      
      this.fingerprint.webgl = {
        available: true,
        version: webgl2 ? 'WebGL 2.0' : 'WebGL 1.0',
        vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Không khả dụng',
        renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Không khả dụng',
        vendorGl: gl.getParameter(gl.VENDOR),
        rendererGl: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        antialiasing: gl.getContextAttributes().antialias,
        extensions: gl.getSupportedExtensions(),
        maxParams: this.getWebGLMaxParams(gl),
        maxTextureDimensions: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxCubeMapTextureDimensions: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
        maxRenderBufferDimensions: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxViewportDimensions: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
        aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
        maxAnisotropy: this.getMaxAnisotropy(gl),
        precisionFormat: this.getPrecisionFormat(gl),
        shadinImageUnits: gl.getParameter(gl.MAX_SHADER_TEXTURE_IMAGE_UNITS),
        vertexTextureUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        fragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        vertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        fragmentAttributes: gl.getParameter(gl.MAX_FRAGMENT_ATTRIBS),
        vertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        varyingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      };
      
      // Kiểm tra WebGPU
      if ('gpu' in navigator) {
        this.fingerprint.webgl.webgpu = true;
      }
    } catch (e) {
      this.fingerprint.webgl = { error: e.message };
    }
  }

  // Lấy các thông số tối đa của WebGL
  getWebGLMaxParams(gl) {
    return {
      maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
    };
  }

  // Lấy giá trị anisotropy tối đa
  getMaxAnisotropy(gl) {
    const ext = gl.getExtension('EXT_texture_filter_anisotropic') || 
                gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') || 
                gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
    
    if (ext) {
      return gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    }
    
    return 'Không khả dụng';
  }

  // Lấy format độ chính xác
  getPrecisionFormat(gl) {
    const formatsList = [
      'FLOAT', 'INT'
    ];
    const shaderList = [
      'VERTEX', 'FRAGMENT'
    ];
    const precisionList = [
      'HIGH', 'MEDIUM', 'LOW'
    ];
    const formats = {};
    
    for (const shader of shaderList) {
      formats[shader] = {};
      for (const format of formatsList) {
        formats[shader][format] = {};
        for (const precision of precisionList) {
          const shaderPrecisionFormat = gl.getShaderPrecisionFormat(
            gl[`${shader}_SHADER`], 
            gl[`${precision}_${format}`]
          );
          
          if (shaderPrecisionFormat) {
            formats[shader][format][precision] = {
              rangeMin: shaderPrecisionFormat.rangeMin,
              rangeMax: shaderPrecisionFormat.rangeMax,
              precision: shaderPrecisionFormat.precision
            };
          }
        }
      }
    }
    
    return formats;
  }

  // Thu thập thông tin font
  async collectFonts() {
    try {
      const baseFonts = ['monospace', 'sans-serif', 'serif'];
      const testString = 'mmmmmmmmmmlli';
      const testSize = '72px';
      const testFonts = [
        'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Bookman Old Style',
        'Bradley Hand', 'Century', 'Century Gothic', 'Comic Sans MS', 'Courier',
        'Courier New', 'Georgia', 'Gentium', 'Impact', 'King', 'Lucida Console',
        'Lalit', 'Modena', 'Monotype Corsiva', 'Papyrus', 'Tahoma', 'TeX',
        'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Verona'
      ];
      
      // Tạo element để kiểm tra font
      const h = document.createElement('span');
      h.style.position = 'absolute';
      h.style.left = '-9999px';
      h.style.fontSize = testSize;
      h.innerHTML = testString;
      document.body.appendChild(h);
      
      const defaultWidth = {};
      const defaultHeight = {};
      
      // Lấy kích thước mặc định
      for (let index = 0; index < baseFonts.length; index++) {
        h.style.fontFamily = baseFonts[index];
        defaultWidth[baseFonts[index]] = h.offsetWidth;
        defaultHeight[baseFonts[index]] = h.offsetHeight;
      }
      
      const detected = [];
      let fontCount = 0;
      
      // Kiểm tra từng font
      for (let i = 0; i < testFonts.length; i++) {
        const font = testFonts[i];
        const detectedCount = 0;
        
        for (let j = 0; j < baseFonts.length; j++) {
          const baseFont = baseFonts[j];
          h.style.fontFamily = font + ',' + baseFont;
          
          // Font is available if size is different than the base font
          if (h.offsetWidth !== defaultWidth[baseFont] || h.offsetHeight !== defaultHeight[baseFont]) {
            detected.push(font);
            fontCount++;
            break;
          }
        }
      }
      
      document.body.removeChild(h);
      this.fingerprint.fonts = {
        fontsDetected: detected,
        fontsCount: fontCount
      };
      
      // Check for modern font access API if available
      if ('queryLocalFonts' in window) {
        try {
          const availableFonts = await window.queryLocalFonts();
          this.fingerprint.fonts.modernFontApi = {
            available: true,
            fontsCount: availableFonts.length,
            // Only collect a sample of fonts to avoid excessive data
            fontsSample: availableFonts.slice(0, 10).map(font => font.family)
          };
        } catch (e) {
          this.fingerprint.fonts.modernFontApi = {
            available: true,
            error: e.message
          };
        }
      } else {
        this.fingerprint.fonts.modernFontApi = {
          available: false
        };
      }
    } catch (e) {
      this.fingerprint.fonts = { error: e.message };
    }
  }

  // Audio fingerprinting
  async collectAudioInfo() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Get basic audio capabilities
      this.fingerprint.audio = {
        sampleRate: audioContext.sampleRate,
        state: audioContext.state,
        maxChannelCount: audioContext.destination.maxChannelCount,
        numberOfInputs: audioContext.destination.numberOfInputs,
        numberOfOutputs: audioContext.destination.numberOfOutputs,
        channelCount: audioContext.destination.channelCount,
        channelCountMode: audioContext.destination.channelCountMode,
        channelInterpretation: audioContext.destination.channelInterpretation
      };
      
      // Test OscillatorNode for audio processing fingerprint
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      gainNode.gain.value = 0; // Mute the sound
      oscillator.type = 'triangle'; // Use triangle wave
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Get a short audio signature
      analyser.getByteFrequencyData(dataArray);
      
      // Hash the first 50 frequency values
      const audioFingerprint = this.hashString(dataArray.slice(0, 50).join(','));
      this.fingerprint.audio.fingerprint = audioFingerprint;
      
      // Clean up
      oscillator.stop(0);
      oscillator.disconnect();
      analyser.disconnect();
      gainNode.disconnect();
      audioContext.close();
    } catch (e) {
      this.fingerprint.audio = { error: e.message };
    }
  }

  // Network information
  async collectNetworkInfo() {
    try {
      this.fingerprint.network = {};
      
      // Check Connection API
      if ('connection' in navigator) {
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;
        
        if (connection) {
          this.fingerprint.network = {
            effectiveType: connection.effectiveType,
            type: connection.type,
            downlink: connection.downlink,
            downlinkMax: connection.downlinkMax,
            rtt: connection.rtt,
            saveData: connection.saveData
          };
        }
      }
      
      // IP Lookup is usually done server-side
      // For privacy and security reasons, we don't make external requests here
      
      // WebRTC detection (without IP detection)
      this.fingerprint.network.webrtcSupport = {
        RTCPeerConnection: 'RTCPeerConnection' in window,
        RTCDataChannel: 'RTCDataChannel' in window,
        RTCSessionDescription: 'RTCSessionDescription' in window
      };
    } catch (e) {
      this.fingerprint.network = { error: e.message };
    }
  }

  // Storage information
  async collectStorageInfo() {
    try {
      this.fingerprint.storage = {
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        indexedDB: !!window.indexedDB,
        cookiesEnabled: navigator.cookieEnabled
      };
      
      // Check for storage limits
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          this.fingerprint.storage.quota = {
            usage: estimate.usage,
            quota: estimate.quota,
            usagePercentage: Math.round((estimate.usage / estimate.quota) * 100)
          };
        } catch (e) {
          this.fingerprint.storage.quota = { error: e.message };
        }
      }
      
      // Check persistence
      if (navigator.storage && navigator.storage.persisted) {
        try {
          const isPersisted = await navigator.storage.persisted();
          this.fingerprint.storage.persistence = {
            persisted: isPersisted
          };
        } catch (e) {
          this.fingerprint.storage.persistence = { error: e.message };
        }
      }
      
      // Check Cache API
      if ('caches' in window) {
        this.fingerprint.storage.cacheAPI = true;
      }
    } catch (e) {
      this.fingerprint.storage = { error: e.message };
    }
  }

  // Battery information
  async collectBatteryInfo() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        
        this.fingerprint.battery = {
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
          level: battery.level
        };
      } else {
        this.fingerprint.battery = { available: false };
      }
    } catch (e) {
      this.fingerprint.battery = { error: e.message };
    }
  }

  // Media capabilities
  async collectMediaInfo() {
    try {
      this.fingerprint.media = {
        videoTypes: [],
        audioTypes: [],
        mediaDevices: 'mediaDevices' in navigator
      };
      
      // Check standard media formats
      const videoFormats = [
        'video/mp4; codecs="avc1.42E01E"',
        'video/webm; codecs="vp9"',
        'video/webm; codecs="vp8"',
        'video/ogg; codecs="theora"',
        'video/mp4; codecs="hev1"',
        'video/mp4; codecs="av01"'
      ];
      
      const audioFormats = [
        'audio/mp4; codecs="mp4a.40.2"',
        'audio/mpeg',
        'audio/webm; codecs="vorbis"',
        'audio/webm; codecs="opus"',
        'audio/ogg; codecs="flac"',
        'audio/wav; codecs="1"'
      ];

      // Check video format support
      for (const format of videoFormats) {
        const support = MediaSource && MediaSource.isTypeSupported ? 
                        MediaSource.isTypeSupported(format) : 
                        'canPlayType' in document.createElement('video') ? 
                        document.createElement('video').canPlayType(format) !== '' : 
                        'unknown';
                        
        this.fingerprint.media.videoTypes.push({
          format,
          supported: support
        });
      }
      
      // Check audio format support
      for (const format of audioFormats) {
        const support = MediaSource && MediaSource.isTypeSupported ? 
                        MediaSource.isTypeSupported(format) : 
                        'canPlayType' in document.createElement('audio') ? 
                        document.createElement('audio').canPlayType(format) !== '' : 
                        'unknown';
                        
        this.fingerprint.media.audioTypes.push({
          format,
          supported: support
        });
      }
      
      // Check for media capabilities API
      if ('mediaCapabilities' in navigator) {
        this.fingerprint.media.mediaCapabilitiesAPI = true;
      }
      
      // Enumerate media devices counts (without actual access)
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const deviceTypes = {
            audioInput: 0,
            audioOutput: 0,
            videoInput: 0
          };
          
          devices.forEach(device => {
            if (device.kind in deviceTypes) {
              deviceTypes[device.kind]++;
            }
          });
          
          this.fingerprint.media.devices = deviceTypes;
        } catch (e) {
          this.fingerprint.media.devices = { error: e.message };
        }
      }
    } catch (e) {
      this.fingerprint.media = { error: e.message };
    }
  }

  // Sensor information
  async collectSensors() {
    try {
      this.fingerprint.sensors = {
        deviceMotion: 'DeviceMotionEvent' in window,
        deviceOrientation: 'DeviceOrientationEvent' in window,
        absoluteOrientation: 'DeviceOrientationEvent' in window && 'absolute' in DeviceOrientationEvent.prototype,
        accelerometer: 'Accelerometer' in window,
        gyroscope: 'Gyroscope' in window,
        magnetometer: 'Magnetometer' in window,
        ambientLightSensor: 'AmbientLightSensor' in window,
        geolocation: 'geolocation' in navigator,
        proximity: 'ProximitySensor' in window
      };
      
      // Check for Sensor API permissions
      if ('permissions' in navigator) {
        try {
          // Only check for accelerometer as an example
          const status = await navigator.permissions.query({ name: 'accelerometer' });
          this.fingerprint.sensors.accelerometerPermission = status.state;
        } catch (e) {
          // Permission query not supported or denied
          this.fingerprint.sensors.accelerometerPermission = 'error';
        }
      }
    } catch (e) {
      this.fingerprint.sensors = { error: e.message };
    }
  }

  // Navigator properties
  async collectNavigatorProps() {
    try {
      // Collect all non-function properties of the navigator object
      const props = {};
      const navigatorProps = Object.getOwnPropertyNames(navigator);
      
      for (const prop of navigatorProps) {
        try {
          const value = navigator[prop];
          
          // Skip functions and complex objects to avoid huge output
          if (typeof value !== 'function' && 
              typeof value !== 'object' &&
              prop !== 'plugins' && 
              prop !== 'mimeTypes') {
            props[prop] = value;
          }
        } catch (e) {
          props[prop] = 'access denied';
        }
      }
      
      this.fingerprint.navigatorProps = props;
      
      // Check for user activation features
      if ('userActivation' in navigator) {
        this.fingerprint.navigatorProps.userActivation = {
          hasBeenActive: navigator.userActivation.hasBeenActive,
          isActive: navigator.userActivation.isActive
        };
      }
      
      // Check for non-standard navigator properties
      const nonStandardProps = [
        'buildID', 'credentials', 'keyboard', 'activeVRDisplays', 
        'standalone', 'wakeLock', 'virtualKeyboard', 'canShare'
      ];
      
      this.fingerprint.navigatorProps.nonStandardSupport = {};
      
      for (const prop of nonStandardProps) {
        this.fingerprint.navigatorProps.nonStandardSupport[prop] = prop in navigator;
      }
    } catch (e) {
      this.fingerprint.navigatorProps = { error: e.message };
    }
  }

  // Permissions API
  async collectPermissions() {
    try {
      if (!('permissions' in navigator)) {
        this.fingerprint.permissions = { supported: false };
        return;
      }
      
      this.fingerprint.permissions = { supported: true, states: {} };
      
      // Common permission names that can be queried
      const permissionNames = [
        'geolocation', 'notifications', 'persistent-storage',
        'push', 'screen-wake-lock', 'clipboard-read',
        'clipboard-write', 'microphone', 'camera',
        'midi', 'background-sync', 'accelerometer',
        'gyroscope', 'magnetometer', 'ambient-light-sensor'
      ];
      
      // Query permissions (without awaiting all to avoid long delays)
      for (const name of permissionNames) {
        try {
          const status = await navigator.permissions.query({ name });
          this.fingerprint.permissions.states[name] = status.state;
        } catch (e) {
          // Some browsers throw if the permission isn't implemented
          this.fingerprint.permissions.states[name] = 'unsupported';
        }
      }
    } catch (e) {
      this.fingerprint.permissions = { error: e.message };
    }
  }

  // User behavior data
  async collectBehaviorData() {
    try {
      this.fingerprint.behavior = {
        timestamp: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        languages: navigator.languages,
        doNotTrack: navigator.doNotTrack,
        screenOrientation: screen.orientation ? screen.orientation.type : 'unknown'
      };
      
      // Touch support
      if ('ontouchstart' in window) {
        this.fingerprint.behavior.touchPoints = navigator.maxTouchPoints || 0;
      } else {
        this.fingerprint.behavior.touchPoints = 0;
      }
      
      // Check for automation signals
      this.fingerprint.behavior.automation = {
        webdriver: navigator.webdriver ? true : false,
        selenium: !!window.document.selenium,
        documentAutomation: !!window.document.$chrome_asyncScriptInfo,
        domAutomation: !!window.domAutomation,
        external: !!window.external && !!window.external.toString && window.external.toString().indexOf('Sequentum') > -1,
        phantom: typeof window.callPhantom === 'function' || !!window._phantom,
        nightmareJS: !!window.__nightmare,
        hasChrome: !!window.chrome,
        chromeWebstoreInstall: typeof chrome !== 'undefined' && chrome !== null && typeof chrome.webstore !== 'undefined' && chrome.webstore !== null
      };
    } catch (e) {
      this.fingerprint.behavior = { error: e.message };
    }
  }

  // Generate a hash from a string
  hashString(str) {
    if (!str || typeof str !== 'string') {
      return 'invalid_input';
    }
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to a positive hex string
    return (hash >>> 0).toString(16);
  }

  // Generate final fingerprint hash
  generateFingerprintHash() {
    // Create a stable JSON representation of the fingerprint data for hashing
    try {
      // Extract most stable and unique properties
      const stableProps = {
        userAgent: this.fingerprint.userAgent,
        language: this.fingerprint.languages,
        platform: this.fingerprint.platform,
        screenProps: {
          width: this.fingerprint.screen?.width,
          height: this.fingerprint.screen?.height,
          colorDepth: this.fingerprint.screen?.colorDepth,
          pixelDepth: this.fingerprint.screen?.pixelDepth,
          devicePixelRatio: this.fingerprint.screen?.devicePixelRatio
        },
        timezoneOffset: this.fingerprint.time?.timezoneOffset,
        timezone: this.fingerprint.time?.timezone,
        cpuCores: this.fingerprint.hardware?.hardwareConcurrency,
        deviceMemory: this.fingerprint.hardware?.deviceMemory,
        canvas: this.fingerprint.canvas,
        webgl: {
          vendor: this.fingerprint.webgl?.vendor,
          renderer: this.fingerprint.webgl?.renderer,
          extensions: this.fingerprint.webgl?.extensions
        },
        fonts: this.fingerprint.fonts?.fontsCount,
        audio: this.fingerprint.audio?.fingerprint,
        plugins: this.fingerprint.browser?.plugins?.length || 0
      };
      
      // Generate hash from stable props
      const jsonString = JSON.stringify(stableProps);
      return this.hashString(jsonString);
    } catch (e) {
      console.error("Error generating fingerprint hash:", e);
      return this.hashString(navigator.userAgent + Date.now());
    }
  }
}

// Export the class for use in other modules
export { BrowserFingerprint };
