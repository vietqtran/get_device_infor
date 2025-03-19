/**
 * Fingerprinting toàn diện cho trình duyệt và thiết bị
 */
class BrowserFingerprint {
   constructor() {
      this.fingerprint = {}
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
         ])

         // Tính toán ID ngẫu nhiên (có thể thay thế bằng thuật toán phức tạp hơn)
         this.fingerprint.fingerprintId = this.generateFingerprintHash()

         return this.fingerprint
      } catch (error) {
         console.error('Lỗi khi thu thập fingerprint:', error)
         return { error: error.message }
      }
   }

   // Thu thập thông tin cơ bản
   async collectBasicInfo() {
      // Thông tin về User Agent - chuỗi nhận dạng trình duyệt, hệ điều hành, phiên bản
      this.fingerprint.userAgent = navigator.userAgent
      // Nền tảng thiết bị: Win32, MacIntel, Linux x86_64, iPhone, Android, etc.
      this.fingerprint.platform = navigator.platform
      // Loại CPU, thường chỉ có trên IE (đã lỗi thời): x86, x64, ARM, etc.
      this.fingerprint.cpuClass = navigator.cpuClass || 'Không khả dụng'
      // Cài đặt Do Not Track: "1" (bật), "0" (tắt), "unspecified" hoặc null (không cấu hình)
      this.fingerprint.doNotTrack =
         navigator.doNotTrack ||
         navigator.msDoNotTrack ||
         window.doNotTrack ||
         'Không khả dụng'
      // Danh sách ngôn ngữ ưu tiên của người dùng: ["vi-VN", "vi", "en-US", "en"]
      this.fingerprint.languages = navigator.languages || [
         navigator.language || navigator.userLanguage
      ]
      // Thông tin về CPU và hệ điều hành, chủ yếu có trên Firefox
      this.fingerprint.oscpu = navigator.oscpu || 'Không khả dụng'
      // Nhà cung cấp trình duyệt: "Google Inc.", "Apple Computer, Inc.", etc.
      this.fingerprint.vendor = navigator.vendor || 'Không khả dụng'
      // Phiên bản con của nhà cung cấp, thường là chuỗi rỗng
      this.fingerprint.vendorSub = navigator.vendorSub || 'Không khả dụng'
      // Xác định nền tảng của trình duyệt: "Chrome", "WebKit", "Mozilla", etc.
      this.fingerprint.productSub = navigator.productSub || 'Không khả dụng'
      // Trình duyệt có hỗ trợ cookie không: true/false
      this.fingerprint.cookieEnabled = navigator.cookieEnabled
      // Tên ứng dụng (đã lỗi thời): "Netscape", "Microsoft Internet Explorer", etc.
      this.fingerprint.appName = navigator.appName || 'Không khả dụng'
      // Phiên bản ứng dụng, thường chứa thông tin chi tiết về trình duyệt và hệ điều hành
      this.fingerprint.appVersion = navigator.appVersion || 'Không khả dụng'
      // Mã ứng dụng, thường trả về "Mozilla"
      this.fingerprint.appCodeName = navigator.appCodeName || 'Không khả dụng'
      // ID bản build, chủ yếu có trên Firefox
      this.fingerprint.buildID = navigator.buildID || 'Không khả dụng'
      // Sản phẩm trình duyệt, thường trả về "Gecko"
      this.fingerprint.product = navigator.product || 'Không khả dụng'
      // Dữ liệu User Agent hiện đại (API mới của Chrome)
      this.fingerprint.userAgentData = this.getUserAgentData()
   }

   // Thu thập thông tin hiện đại từ userAgentData
   getUserAgentData() {
      // API userAgentData chủ yếu có trên Chrome 89+ và trình duyệt dựa trên Chromium
      if (!navigator.userAgentData) return 'Không khả dụng'

      const uaData = {
         // Danh sách thương hiệu trình duyệt: [{"brand":"Chrome","version":"119"}, {"brand":"Chromium","version":"119"}]
         brands: navigator.userAgentData.brands,
         // Xác định nếu thiết bị là di động: true/false
         mobile: navigator.userAgentData.mobile
      }

      if (navigator.userAgentData.getHighEntropyValues) {
         // Yêu cầu thông tin chi tiết (có thể cần người dùng chấp nhận)
         navigator.userAgentData
            .getHighEntropyValues([
               // Kiến trúc CPU: "arm", "x86", "x64", etc.
               'architecture',
               // Độ rộng bit của CPU: "32" hoặc "64"
               'bitness',
               // Tên model thiết bị (chủ yếu trên mobile): "iPhone", "SM-G981U", etc.
               'model',
               // Phiên bản chi tiết của nền tảng, ví dụ: "10.0.0" cho Windows 10
               'platformVersion',
               // Danh sách phiên bản đầy đủ của trình duyệt và các thành phần
               'fullVersionList'
            ])
            .then((highEntropyValues) => {
               // Kết hợp dữ liệu chi tiết vào uaData
               Object.assign(uaData, highEntropyValues)
            })
            .catch((e) => {
               // Nếu người dùng từ chối hoặc API không được hỗ trợ đầy đủ
               console.log('Không thể lấy high entropy values:', e)
            })
      }

      return uaData
   }

   // Thu thập thông tin màn hình
   async collectScreenInfo() {
      const screen = window.screen || {}

      this.fingerprint.screen = {
         // Chiều rộng toàn màn hình (pixel)
         width: screen.width,
         // Chiều cao toàn màn hình (pixel)
         height: screen.height,
         // Chiều rộng khả dụng của màn hình trừ thanh tác vụ/dock (pixel)
         availWidth: screen.availWidth,
         // Chiều cao khả dụng của màn hình trừ thanh tác vụ/dock (pixel)
         availHeight: screen.availHeight,
         // Độ sâu màu - số bit biểu diễn màu sắc trên mỗi pixel
         colorDepth: screen.colorDepth,
         // Số bit trên mỗi pixel màu (thường giống colorDepth)
         pixelDepth: screen.pixelDepth,
         // Thông tin hướng hiển thị màn hình: ngang (landscape) hoặc dọc (portrait)
         orientation: screen.orientation
            ? {
                 // Kiểu hướng: "portrait-primary", "landscape-primary", v.v.
                 type: screen.orientation.type,
                 // Góc xoay tính bằng độ (0, 90, 180, 270)
                 angle: screen.orientation.angle
              }
            : 'Không khả dụng',
         // Tỷ lệ điểm ảnh thực tế trên điểm ảnh CSS (phóng to trên màn hình độ phân giải cao)
         devicePixelRatio: window.devicePixelRatio,
         // Chiều rộng vùng hiển thị của cửa sổ trình duyệt (viewport)
         innerWidth: window.innerWidth,
         // Chiều cao vùng hiển thị của cửa sổ trình duyệt (viewport)
         innerHeight: window.innerHeight,
         // Chiều rộng toàn bộ cửa sổ trình duyệt bao gồm thanh cuộn
         outerWidth: window.outerWidth,
         // Chiều cao toàn bộ cửa sổ trình duyệt bao gồm thanh công cụ, thanh địa chỉ
         outerHeight: window.outerHeight
      }

      // Media queries để phát hiện tính năng
      this.fingerprint.mediaFeatures = {
         // Người dùng đã bật chế độ tối trên thiết bị
         darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
         // Người dùng đã bật chế độ sáng trên thiết bị
         lightMode: window.matchMedia('(prefers-color-scheme: light)').matches,
         // Người dùng đã bật tùy chọn giảm chuyển động (cho người dễ bị chóng mặt)
         reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches,
         // Thiết bị có khả năng hover (như máy tính có chuột)
         hoverAvailable: window.matchMedia('(hover: hover)').matches,
         // Thiết bị có con trỏ chính xác (như chuột, không phải màn hình cảm ứng)
         finePointer: window.matchMedia('(pointer: fine)').matches,
         // Dải màu mà màn hình hỗ trợ (sRGB, P3, rec2020)
         colorGamut: this.detectColorGamut(),
         // Người dùng đã bật chế độ đảo ngược màu sắc
         invertedColors: window.matchMedia('(inverted-colors: inverted)')
            .matches,
         // Mức độ tương phản người dùng đã thiết lập (normal, more, less, custom)
         contrastLevel: this.detectContrast()
      }
   }

   // Phát hiện gamut màu
   detectColorGamut() {
      if (window.matchMedia('(color-gamut: rec2020)').matches) {
         return 'rec2020'
      } else if (window.matchMedia('(color-gamut: p3)').matches) {
         return 'p3'
      } else if (window.matchMedia('(color-gamut: srgb)').matches) {
         return 'srgb'
      } else {
         return 'unknown'
      }
   }

   // Phát hiện tương phản
   detectContrast() {
      if (window.matchMedia('(prefers-contrast: more)').matches) {
         return 'more'
      } else if (window.matchMedia('(prefers-contrast: less)').matches) {
         return 'less'
      } else if (window.matchMedia('(prefers-contrast: custom)').matches) {
         return 'custom'
      } else {
         return 'normal'
      }
   }

   // Thu thập thông tin phần cứng
   async collectHardwareInfo() {
      this.fingerprint.hardware = {
         // Lượng RAM của thiết bị (tính bằng GB), chỉ có trên Chrome và Edge mới
         deviceMemory: navigator.deviceMemory || 'Không khả dụng',
         // Số lõi CPU vật lý của thiết bị, quan trọng để đánh giá hiệu suất
         hardwareConcurrency: navigator.hardwareConcurrency || 'Không khả dụng',
         // Số điểm chạm tối đa trên màn hình cảm ứng, 0 nếu không có cảm ứng
         maxTouchPoints: navigator.maxTouchPoints || 0
      }

      // Phát hiện tính năng phần cứng
      this.fingerprint.hardwareCapabilities = {
         // Khả năng kết nối với thiết bị Bluetooth
         bluetooth: 'bluetooth' in navigator,
         // Khả năng kết nối với thiết bị USB
         usb: 'usb' in navigator,
         // Khả năng kết nối với cổng Serial
         serial: 'serial' in navigator,
         // Khả năng đọc/ghi thẻ NFC (Near Field Communication)
         nfc: 'nfc' in navigator,
         // Khả năng kết nối với thiết bị HID (Human Interface Device) như bàn phím, chuột đặc biệt
         hid: 'hid' in navigator,
         // Hỗ trợ tay cầm chơi game
         gamepads: 'getGamepads' in navigator,
         // Hỗ trợ công nghệ thực tế ảo và thực tế tăng cường
         virtualReality: 'xr' in navigator
      }
   }

   // Thu thập thông tin múi giờ
   async collectTimeInfo() {
      const date = new Date()
      this.fingerprint.time = {
         // Múi giờ của người dùng, tính bằng số phút chênh lệch so với UTC
         timezoneOffset: date.getTimezoneOffset(),
         // Tên múi giờ theo chuẩn IANA, ví dụ: "Asia/Ho_Chi_Minh", "America/New_York"
         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
         // Chuỗi ngày giờ được định dạng theo locale của người dùng
         localeDateTime: date.toLocaleString(),
         // Locale đã được hệ thống phân giải, ví dụ: "vi-VN", "en-US"
         resolvedLocale: Intl.DateTimeFormat().resolvedOptions().locale,
         dateTimeFormat: {
            // Chuỗi ngày được định dạng đầy đủ theo locale người dùng, bao gồm thứ, tháng, năm
            dateStyle: Intl.DateTimeFormat(undefined, {
               dateStyle: 'full'
            }).format(date),
            // Chuỗi thời gian được định dạng đầy đủ theo locale người dùng, bao gồm giờ, phút, giây, múi giờ
            timeStyle: Intl.DateTimeFormat(undefined, {
               timeStyle: 'full'
            }).format(date)
         }
      }

      // Performance timing
      if (window.performance) {
         this.fingerprint.time.performanceTiming = {
            // Thời điểm bắt đầu điều hướng trang, tính bằng timestamp (ms)
            navigationStart: window.performance.timing
               ? window.performance.timing.navigationStart
               : 'Không khả dụng',
            // Điểm gốc thời gian cho performance API (ms từ epoch)
            timeOrigin: window.performance.timeOrigin || 'Không khả dụng',
            // Số mili giây trôi qua kể từ timeOrigin đến thời điểm hiện tại
            now: window.performance.now()
         }
      }
   }

   // Thu thập thông tin trình duyệt
   async collectBrowserInfo() {
      this.fingerprint.browser = {
         // Danh sách các plugin được cài đặt trong trình duyệt (Flash, Java, PDF, v.v.)
         plugins: this.getPlugins(),
         // Danh sách các kiểu MIME được hỗ trợ bởi trình duyệt
         mimeTypes: this.getMimeTypes(),
         // Kiểm tra xem trình duyệt có tích hợp trình xem PDF không
         pdfViewerEnabled: this.checkPdfViewerEnabled(),
         // Thông tin về khả năng hỗ trợ cảm ứng của thiết bị
         touchSupport: this.getTouchSupport(),
         // Kiểm tra xem Java có được bật trong trình duyệt không
         javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
         // Kiểm tra hỗ trợ MathML (ngôn ngữ đánh dấu toán học)
         mathMLEnabled: this.checkMathML(),
         // Kiểm tra hỗ trợ WebSocket (kết nối hai chiều với máy chủ)
         webSocketEnabled: 'WebSocket' in window,
         // Kiểm tra hỗ trợ Web Workers (xử lý đa luồng trong JavaScript)
         webWorkersEnabled: 'Worker' in window,
         // Kiểm tra hỗ trợ WebAssembly (chạy mã biên dịch hiệu suất cao)
         webAssemblyEnabled: 'WebAssembly' in window,
         // Kiểm tra hỗ trợ Shared Workers (Web Workers dùng chung giữa nhiều tab)
         sharedWorkersEnabled: 'SharedWorker' in window,
         // Kiểm tra hỗ trợ Service Workers (cho phép trang web hoạt động ngoại tuyến)
         serviceWorkersEnabled: 'serviceWorker' in navigator,
         // Kiểm tra hỗ trợ WebRTC (giao tiếp thời gian thực ngang hàng)
         webRTCEnabled: this.checkWebRTC(),
         // Kiểm tra hỗ trợ xác thực Web bằng khóa công khai (WebAuthn)
         webAuthnEnabled:
            'credentials' in navigator && 'PublicKeyCredential' in window,
         // Kiểm tra hỗ trợ chuyển văn bản thành giọng nói
         speechSynthesisEnabled: 'speechSynthesis' in window,
         // Kiểm tra hỗ trợ nhận dạng giọng nói
         speechRecognitionEnabled:
            'SpeechRecognition' in window ||
            'webkitSpeechRecognition' in window,
         // Kiểm tra các khả năng của clipboard (bộ nhớ đệm)
         clipboard: {
            // Có thể đọc văn bản từ clipboard
            readTextEnabled:
               navigator.clipboard && 'readText' in navigator.clipboard,
            // Có thể ghi văn bản vào clipboard
            writeTextEnabled:
               navigator.clipboard && 'writeText' in navigator.clipboard,
            // Có thể đọc nhiều định dạng dữ liệu từ clipboard
            readEnabled: navigator.clipboard && 'read' in navigator.clipboard,
            // Có thể ghi nhiều định dạng dữ liệu vào clipboard
            writeEnabled: navigator.clipboard && 'write' in navigator.clipboard
         },
         // Kiểm tra hỗ trợ IndexedDB (cơ sở dữ liệu client-side)
         indexedDB: 'indexedDB' in window,
         // Kiểm tra hỗ trợ Web SQL (cơ sở dữ liệu SQL trong trình duyệt, đã lỗi thời)
         webSQL: 'openDatabase' in window,
         // Kiểm tra hỗ trợ lưu trữ DOM (localStorage và sessionStorage)
         DOMStorage: 'localStorage' in window && 'sessionStorage' in window,
         // Kiểm tra xem cookies có được bật trong trình duyệt không
         cookiesEnabled: navigator.cookieEnabled,
         // Kiểm tra hỗ trợ quản lý màu sắc nâng cao (dải màu P3)
         colorManagementEnabled:
            window.matchMedia && window.matchMedia('(color-gamut: p3)').matches,
         // Kiểm tra các tính năng hiện đại của trình duyệt (WebGPU, WebUSB, v.v.)
         modernFeatures: this.checkModernFeatures()
      }
   }

   // Lấy danh sách plugins
   getPlugins() {
      if (!navigator.plugins || navigator.plugins.length === 0) {
         return 'Không khả dụng'
      }

      const plugins = []
      for (let i = 0; i < navigator.plugins.length; i++) {
         const plugin = navigator.plugins[i]
         const pluginInfo = {
            name: plugin.name,
            description: plugin.description,
            filename: plugin.filename,
            version: plugin.version,
            mimeTypes: []
         }

         for (let j = 0; j < plugin.length; j++) {
            pluginInfo.mimeTypes.push({
               type: plugin[j].type,
               description: plugin[j].description,
               suffixes: plugin[j].suffixes
            })
         }

         plugins.push(pluginInfo)
      }

      return plugins
   }

   // Lấy danh sách MIME types
   getMimeTypes() {
      if (!navigator.mimeTypes || navigator.mimeTypes.length === 0) {
         return 'Không khả dụng'
      }

      const mimeTypes = []
      for (let i = 0; i < navigator.mimeTypes.length; i++) {
         const mt = navigator.mimeTypes[i]
         mimeTypes.push({
            type: mt.type,
            description: mt.description,
            suffixes: mt.suffixes,
            enabledPlugin: mt.enabledPlugin ? mt.enabledPlugin.name : null
         })
      }

      return mimeTypes
   }

   // Kiểm tra PDF viewer
   checkPdfViewerEnabled() {
      return navigator.pdfViewerEnabled !== undefined
         ? navigator.pdfViewerEnabled
         : navigator.mimeTypes && navigator.mimeTypes['application/pdf']
         ? true
         : false
   }

   // Lấy thông tin về touch support
   getTouchSupport() {
      let maxTouchPoints = 0
      let touchEvent = false
      let touchPoints = 0

      if (navigator.maxTouchPoints !== undefined) {
         maxTouchPoints = navigator.maxTouchPoints
      }

      touchEvent = 'ontouchstart' in window

      if (window.TouchEvent) {
         touchPoints = maxTouchPoints
      }

      return {
         maxTouchPoints,
         touchEvent,
         touchPoints
      }
   }

   // Kiểm tra MathML
   checkMathML() {
      const div = document.createElement('div')
      div.innerHTML = '<math><mrow><mi>x</mi></mrow></math>'
      return div.firstChild && 'MathMLElement' in window
         ? div.firstChild instanceof window.MathMLElement
         : false
   }

   // Kiểm tra WebRTC
   checkWebRTC() {
      return window.RTCPeerConnection ||
         window.webkitRTCPeerConnection ||
         window.mozRTCPeerConnection
         ? true
         : false
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
         backgroundSync:
            'serviceWorker' in navigator && 'SyncManager' in window,
         periodicSync:
            'serviceWorker' in navigator && 'PeriodicSyncManager' in window,
         webLocks: 'locks' in navigator,
         idle: 'IdleDetector' in window,
         contentIndex: 'serviceWorker' in navigator && 'ContentIndex' in window,
         layoutInstability: 'LayoutShift' in window,
         eyeDropper: 'EyeDropper' in window,
         fileSystem: 'showOpenFilePicker' in window
      }
   }

   // Canvas fingerprinting
   async collectCanvasFingerprint() {
      this.fingerprint.canvas = {
         // Dữ liệu canvas cơ bản - vẽ văn bản, gradient và hình dạng để phát hiện sự khác biệt giữa các trình duyệt và thiết bị
         standard: this.getCanvasFingerprint(),

         // Kiểm tra cách trình duyệt hiển thị văn bản - phát hiện sự khác biệt về font rendering, anti-aliasing, và hinting
         text: this.getTextFingerprint(),

         // Sử dụng WebGL để vẽ đồ họa 3D - cung cấp thông tin về GPU và trình điều khiển đồ họa
         webgl: this.getWebGLFingerprint(),

         // Kiểm tra giá trị độc đáo và độ chính xác của pixel - phát hiện sự khác biệt tinh tế trong xử lý màu sắc
         uniqueValues: this.getCanvasUniqueValues()
      }
   }

   // Canvas cơ bản
   getCanvasFingerprint() {
      try {
         const canvas = document.createElement('canvas')
         canvas.width = 200
         canvas.height = 50

         const ctx = canvas.getContext('2d')
         if (!ctx) return 'Canvas context không khả dụng'

         // Vẽ gradient
         const gradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
         )
         gradient.addColorStop(0, 'red')
         gradient.addColorStop(0.5, 'green')
         gradient.addColorStop(1, 'blue')
         ctx.fillStyle = gradient
         ctx.fillRect(0, 0, canvas.width, canvas.height)

         // Vẽ văn bản
         ctx.font = '20px Arial'
         ctx.fillStyle = 'white'
         ctx.fillText('Canvas Fingerprint', 10, 30)

         // Vẽ một số hình dạng
         ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'
         ctx.lineWidth = 2
         ctx.beginPath()
         ctx.arc(180, 25, 20, 0, Math.PI * 2)
         ctx.stroke()

         return this.hashString(canvas.toDataURL())
      } catch (e) {
         return 'Lỗi: ' + e.message
      }
   }

   // Text rendering fingerprint
   getTextFingerprint() {
      try {
         const canvas = document.createElement('canvas')
         canvas.width = 650
         canvas.height = 100

         const ctx = canvas.getContext('2d')
         if (!ctx) return 'Canvas context không khả dụng'

         const testString =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~1!2@3#4$5%6^7&8*9(0)-_=+[{]}\\|;:\'",<.>/?'
         const fonts = [
            'Arial',
            'Georgia',
            'Times New Roman',
            'Courier New',
            'Verdana',
            'Tahoma',
            'Impact',
            'Comic Sans MS',
            'Trebuchet MS',
            'serif',
            'sans-serif',
            'monospace'
         ]

         let y = 10
         for (let font of fonts) {
            ctx.font = `14px ${font}`
            ctx.fillText(testString, 5, y)
            y += 20
         }

         return this.hashString(canvas.toDataURL())
      } catch (e) {
         return 'Lỗi: ' + e.message
      }
   }

   // WebGL fingerprint
   getWebGLFingerprint() {
      try {
         const canvas = document.createElement('canvas')
         const gl =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')
         if (!gl) return 'WebGL không khả dụng'

         // Vẽ tam giác đỏ
         canvas.width = 100
         canvas.height = 100

         // Vertex shader
         const vertexShader = gl.createShader(gl.VERTEX_SHADER)
         gl.shaderSource(
            vertexShader,
            `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `
         )
         gl.compileShader(vertexShader)

         // Fragment shader
         const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
         gl.shaderSource(
            fragmentShader,
            `
        precision mediump float;
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
      `
         )
         gl.compileShader(fragmentShader)

         // Program
         const program = gl.createProgram()
         gl.attachShader(program, vertexShader)
         gl.attachShader(program, fragmentShader)
         gl.linkProgram(program)
         gl.useProgram(program)

         // Buffers
         const buffer = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
         gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.0, 0.5]),
            gl.STATIC_DRAW
         )

         // Attributes
         const positionLocation = gl.getAttribLocation(program, 'position')
         gl.enableVertexAttribArray(positionLocation)
         gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

         // Draw
         gl.clearColor(0.0, 0.0, 0.0, 1.0)
         gl.clear(gl.COLOR_BUFFER_BIT)
         gl.drawArrays(gl.TRIANGLES, 0, 3)

         return this.hashString(canvas.toDataURL())
      } catch (e) {
         return 'Lỗi: ' + e.message
      }
   }

   // Canvas unique values
   getCanvasUniqueValues() {
      try {
         const canvas = document.createElement('canvas')
         canvas.width = 10
         canvas.height = 10

         const ctx = canvas.getContext('2d')
         if (!ctx) return 'Canvas context không khả dụng'

         // Test các giá trị nhỏ, sắc thái tinh tế
         ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'
         ctx.fillRect(0, 0, 1, 1)

         ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'
         ctx.fillRect(2, 0, 1, 1)

         ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'
         ctx.fillRect(4, 0, 1, 1)

         // Test chính xác số học dấu phẩy động
         for (let i = 0; i < 10; i++) {
            ctx.fillStyle = `rgba(${i * 25}, ${i * 15}, ${i * 5}, 0.1)`
            ctx.fillRect(i, 5, 1, 1)
         }

         return this.hashString(canvas.toDataURL())
      } catch (e) {
         return 'Lỗi: ' + e.message
      }
   }

   // Thu thập thông tin WebGL
   async collectWebGLInfo() {
      try {
         const canvas = document.createElement('canvas')
         const gl =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')

         if (!gl) {
            this.fingerprint.webgl = { available: false }
            return
         }

         const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
         const webgl2 = !!document.createElement('canvas').getContext('webgl2')

         this.fingerprint.webgl = {
            // Xác định liệu WebGL có được hỗ trợ trên trình duyệt không
            available: true,
            // Phiên bản WebGL được hỗ trợ: WebGL 1.0 hoặc 2.0
            version: webgl2 ? 'WebGL 2.0' : 'WebGL 1.0',
            // Nhà cung cấp GPU thật sự (không bị ẩn danh), thường hiển thị tên nhà sản xuất như NVIDIA, AMD, Intel
            vendor: debugInfo
               ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
               : 'Không khả dụng',
            // Tên GPU thật sự (không bị ẩn danh), hiển thị thông tin chi tiết về model GPU
            renderer: debugInfo
               ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
               : 'Không khả dụng',
            // Thông tin nhà cung cấp tiêu chuẩn (có thể bị ẩn danh)
            vendorGl: gl.getParameter(gl.VENDOR),
            // Tên renderer tiêu chuẩn (có thể bị ẩn danh)
            rendererGl: gl.getParameter(gl.RENDERER),
            // Phiên bản chi tiết của WebGL, bao gồm thông tin về trình điều khiển
            version: gl.getParameter(gl.VERSION),
            // Phiên bản ngôn ngữ shader GLSL được hỗ trợ
            shadingLanguageVersion: gl.getParameter(
               gl.SHADING_LANGUAGE_VERSION
            ),
            // Xác định xem trình duyệt có bật chế độ khử răng cưa (làm mịn cạnh) không
            antialiasing: gl.getContextAttributes().antialias,
            // Danh sách các tiện ích mở rộng WebGL được hỗ trợ
            extensions: gl.getSupportedExtensions(),
            // Các thông số tối đa cho WebGL (chi tiết về giới hạn phần cứng)
            maxParams: this.getWebGLMaxParams(gl),
            // Kích thước texture tối đa được hỗ trợ (pixel)
            maxTextureDimensions: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            // Kích thước texture cube map tối đa được hỗ trợ (pixel)
            maxCubeMapTextureDimensions: gl.getParameter(
               gl.MAX_CUBE_MAP_TEXTURE_SIZE
            ),
            // Kích thước render buffer tối đa được hỗ trợ (pixel)
            maxRenderBufferDimensions: gl.getParameter(
               gl.MAX_RENDERBUFFER_SIZE
            ),
            // Kích thước viewport tối đa cho rendering (pixel)
            maxViewportDimensions: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            // Phạm vi độ rộng đường được hỗ trợ khi vẽ đường thẳng
            aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
            // Phạm vi kích thước điểm được hỗ trợ khi vẽ điểm
            aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
            // Mức lọc anisotropic tối đa (cải thiện chất lượng texture ở góc nghiêng)
            maxAnisotropy: this.getMaxAnisotropy(gl),
            // Thông tin về độ chính xác của các loại dữ liệu trong shader
            precisionFormat: this.getPrecisionFormat(gl),
            // Số đơn vị texture tối đa có thể sử dụng trong shader
            shadinImageUnits: gl.getParameter(
               gl.MAX_SHADER_TEXTURE_IMAGE_UNITS
            ),
            // Số đơn vị texture tối đa có thể sử dụng trong vertex shader
            vertexTextureUnits: gl.getParameter(
               gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
            ),
            // Số đơn vị texture tối đa có thể sử dụng trong fragment shader
            maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            // Số vector uniform tối đa trong fragment shader
            fragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            // Số vector uniform tối đa trong vertex shader
            vertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            // Số thuộc tính tối đa trong fragment shader
            fragmentAttributes: gl.getParameter(gl.MAX_FRAGMENT_ATTRIBS),
            // Số thuộc tính tối đa trong vertex shader
            vertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            // Số vector varying tối đa được hỗ trợ (dùng để truyền dữ liệu giữa các shader)
            varyingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS)
         }

         // Kiểm tra có hỗ trợ WebGPU không (API đồ họa thế hệ mới sau WebGL)
         if ('gpu' in navigator) {
            this.fingerprint.webgl.webgpu = true
         }
      } catch (e) {
         this.fingerprint.webgl = { error: e.message }
      }
   }

   // Lấy các thông số tối đa của WebGL
   getWebGLMaxParams(gl) {
      return {
         // Số đơn vị texture tối đa có thể sử dụng trong fragment shader
         maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
         // Số đơn vị texture tối đa có thể sử dụng trong vertex shader
         maxVertexTextureImageUnits: gl.getParameter(
            gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
         ),
         // Kích thước tối đa (pixel) của renderbuffer, ảnh hưởng đến độ phân giải tối đa của bộ đệm
         maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
         // Kích thước viewport tối đa [width, height], giới hạn vùng hiển thị
         maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
         // Kích thước texture 2D tối đa (pixel), ảnh hưởng đến độ phân giải texture
         maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
         // Kích thước texture lập phương tối đa (pixel), dùng cho skybox và environment mapping
         maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
         // Số thuộc tính đỉnh tối đa có thể được sử dụng trong vertex shader
         maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
         // Số vector uniform tối đa có thể được sử dụng trong vertex shader
         maxVertexUniformVectors: gl.getParameter(
            gl.MAX_VERTEX_UNIFORM_VECTORS
         ),
         // Số vector varying tối đa có thể truyền từ vertex shader sang fragment shader
         maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
         // Số vector uniform tối đa có thể được sử dụng trong fragment shader
         maxFragmentUniformVectors: gl.getParameter(
            gl.MAX_FRAGMENT_UNIFORM_VECTORS
         ),
         // Tổng số đơn vị texture tối đa có thể sử dụng kết hợp trong cả vertex và fragment shader
         maxCombinedTextureImageUnits: gl.getParameter(
            gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS
         )
      }
   }

   // Lấy giá trị anisotropy tối đa
   getMaxAnisotropy(gl) {
      const ext =
         gl.getExtension('EXT_texture_filter_anisotropic') ||
         gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
         gl.getExtension('MOZ_EXT_texture_filter_anisotropic')

      if (ext) {
         // Giá trị lọc anisotropic tối đa, càng cao càng giúp texture nhìn rõ ở góc nghiêng
         return gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      }

      return 'Không khả dụng'
   }

   // Lấy format độ chính xác
   getPrecisionFormat(gl) {
      const formatsList = ['FLOAT', 'INT']
      const shaderList = ['VERTEX', 'FRAGMENT']
      const precisionList = ['HIGH', 'MEDIUM', 'LOW']
      const formats = {}

      for (const shader of shaderList) {
         formats[shader] = {}
         for (const format of formatsList) {
            formats[shader][format] = {}
            for (const precision of precisionList) {
               const shaderPrecisionFormat = gl.getShaderPrecisionFormat(
                  gl[`${shader}_SHADER`],
                  gl[`${precision}_${format}`]
               )

               if (shaderPrecisionFormat) {
                  formats[shader][format][precision] = {
                     // Giới hạn dưới của phạm vi biểu diễn số, dưới dạng log2
                     rangeMin: shaderPrecisionFormat.rangeMin,
                     // Giới hạn trên của phạm vi biểu diễn số, dưới dạng log2
                     rangeMax: shaderPrecisionFormat.rangeMax,
                     // Số bit dùng cho phần thập phân của số, quyết định độ chính xác
                     precision: shaderPrecisionFormat.precision
                  }
               }
            }
         }
      }

      return formats
   }

   // Thu thập thông tin font
   async collectFonts() {
      try {
         // Danh sách font cơ bản dùng để so sánh
         const baseFonts = ['monospace', 'sans-serif', 'serif']
         // Chuỗi ký tự dùng để kiểm tra hiển thị font
         const testString = 'mmmmmmmmmmlli'
         // Kích thước font dùng để kiểm tra
         const testSize = '72px'
         // Danh sách font cần kiểm tra trên thiết bị người dùng
         const testFonts = [
            'Arial',
            'Arial Black',
            'Arial Narrow',
            'Arial Rounded MT Bold',
            'Bookman Old Style',
            'Bradley Hand',
            'Century',
            'Century Gothic',
            'Comic Sans MS',
            'Courier',
            'Courier New',
            'Georgia',
            'Gentium',
            'Impact',
            'King',
            'Lucida Console',
            'Lalit',
            'Modena',
            'Monotype Corsiva',
            'Papyrus',
            'Tahoma',
            'TeX',
            'Times',
            'Times New Roman',
            'Trebuchet MS',
            'Verdana',
            'Verona'
         ]

         // Tạo phần tử HTML để kiểm tra kích thước hiển thị font
         const h = document.createElement('span')
         // Đặt phần tử ở vị trí không hiển thị trên màn hình
         h.style.position = 'absolute'
         h.style.left = '-9999px'
         // Đặt kích thước font lớn để dễ phát hiện sự khác biệt
         h.style.fontSize = testSize
         // Đặt nội dung kiểm tra vào phần tử
         h.innerHTML = testString
         // Thêm phần tử vào DOM để có thể tính toán kích thước
         document.body.appendChild(h)

         // Đối tượng lưu chiều rộng mặc định của các font cơ bản
         const defaultWidth = {}
         // Đối tượng lưu chiều cao mặc định của các font cơ bản
         const defaultHeight = {}

         // Đo kích thước hiển thị mặc định của các font cơ bản
         for (let index = 0; index < baseFonts.length; index++) {
            // Đặt font cơ bản cho phần tử kiểm tra
            h.style.fontFamily = baseFonts[index]
            // Lưu lại chiều rộng của phần tử với font cơ bản
            defaultWidth[baseFonts[index]] = h.offsetWidth
            // Lưu lại chiều cao của phần tử với font cơ bản
            defaultHeight[baseFonts[index]] = h.offsetHeight
         }

         // Mảng lưu các font đã phát hiện được
         const detected = []
         // Số lượng font đã phát hiện
         let fontCount = 0

         // Duyệt qua từng font cần kiểm tra
         for (let i = 0; i < testFonts.length; i++) {
            const font = testFonts[i]
            const detectedCount = 0

            // Kiểm tra với từng font cơ bản
            for (let j = 0; j < baseFonts.length; j++) {
               const baseFont = baseFonts[j]
               // Đặt font cần kiểm tra với font dự phòng là font cơ bản
               h.style.fontFamily = font + ',' + baseFont

               // Font tồn tại nếu kích thước khác với font cơ bản
               if (
                  h.offsetWidth !== defaultWidth[baseFont] ||
                  h.offsetHeight !== defaultHeight[baseFont]
               ) {
                  detected.push(font)
                  fontCount++
                  break
               }
            }
         }

         // Xóa phần tử kiểm tra khỏi DOM
         document.body.removeChild(h)
         // Lưu kết quả kiểm tra font vào fingerprint
         this.fingerprint.fonts = {
            // Danh sách các font đã phát hiện được trên thiết bị
            fontsDetected: detected,
            // Số lượng font đã phát hiện được
            fontsCount: fontCount
         }

         // Kiểm tra API truy cập font hiện đại (nếu có)
         if ('queryLocalFonts' in window) {
            try {
               // Sử dụng API hiện đại để lấy danh sách font
               const availableFonts = await window.queryLocalFonts()
               this.fingerprint.fonts.modernFontApi = {
                  // Xác nhận API hiện đại được hỗ trợ
                  available: true,
                  // Tổng số font phát hiện được qua API hiện đại
                  fontsCount: availableFonts.length,
                  // Chỉ lấy mẫu 10 font đầu tiên để tránh dữ liệu quá lớn
                  fontsSample: availableFonts
                     .slice(0, 10)
                     .map((font) => font.family)
               }
            } catch (e) {
               // Xử lý lỗi khi sử dụng API hiện đại
               this.fingerprint.fonts.modernFontApi = {
                  // Xác nhận API hiện đại được hỗ trợ nhưng gặp lỗi
                  available: true,
                  // Thông báo lỗi khi sử dụng API
                  error: e.message
               }
            }
         } else {
            // API hiện đại không được hỗ trợ
            this.fingerprint.fonts.modernFontApi = {
               // Xác nhận API hiện đại không được hỗ trợ
               available: false
            }
         }
      } catch (e) {
         // Xử lý lỗi tổng thể trong quá trình kiểm tra font
         this.fingerprint.fonts = { error: e.message }
      }
   }

   // Audio fingerprinting
   async collectAudioInfo() {
      try {
         const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)()

         // Get basic audio capabilities
         this.fingerprint.audio = {
            // Tần số lấy mẫu của AudioContext, thường là 44100Hz hoặc 48000Hz
            sampleRate: audioContext.sampleRate,
            // Trạng thái hiện tại của AudioContext: running, suspended, hoặc closed
            state: audioContext.state,
            // Số kênh tối đa mà đích đến âm thanh có thể hỗ trợ
            maxChannelCount: audioContext.destination.maxChannelCount,
            // Số lượng đầu vào kết nối đến đích âm thanh
            numberOfInputs: audioContext.destination.numberOfInputs,
            // Số lượng đầu ra từ đích âm thanh
            numberOfOutputs: audioContext.destination.numberOfOutputs,
            // Số kênh âm thanh hiện tại của đích (thường là 2 cho stereo)
            channelCount: audioContext.destination.channelCount,
            // Cách xử lý kênh âm thanh: max, clamped-max, hoặc explicit
            channelCountMode: audioContext.destination.channelCountMode,
            // Cách diễn giải kênh âm thanh: speakers hoặc discrete
            channelInterpretation:
               audioContext.destination.channelInterpretation
         }

         // Test OscillatorNode for audio processing fingerprint
         const oscillator = audioContext.createOscillator()
         const analyser = audioContext.createAnalyser()
         const gainNode = audioContext.createGain()
         const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

         gainNode.gain.value = 0 // Mute the sound
         oscillator.type = 'triangle' // Use triangle wave
         oscillator.connect(analyser)
         analyser.connect(gainNode)
         gainNode.connect(audioContext.destination)

         oscillator.start(0)

         analyser.fftSize = 2048
         const bufferLength = analyser.frequencyBinCount
         const dataArray = new Uint8Array(bufferLength)

         // Get a short audio signature
         analyser.getByteFrequencyData(dataArray)

         // Hash the first 50 frequency values
         const audioFingerprint = this.hashString(
            dataArray.slice(0, 50).join(',')
         )
         // Mã băm từ dữ liệu tần số âm thanh, tạo ra dấu vân tay độc nhất
         this.fingerprint.audio.fingerprint = audioFingerprint

         // Clean up
         oscillator.stop(0)
         oscillator.disconnect()
         analyser.disconnect()
         gainNode.disconnect()
         audioContext.close()
      } catch (e) {
         // Đối tượng lỗi nếu quá trình thu thập thông tin âm thanh thất bại
         this.fingerprint.audio = { error: e.message }
      }
   }

   // Network information
   async collectNetworkInfo() {
      try {
         this.fingerprint.network = {}

         // Check Connection API
         if ('connection' in navigator) {
            const connection =
               navigator.connection ||
               navigator.mozConnection ||
               navigator.webkitConnection

            if (connection) {
               this.fingerprint.network = {
                  // Loại kết nối di động hiệu quả: 'slow-2g', '2g', '3g', '4g'
                  effectiveType: connection.effectiveType,
                  // Loại kết nối: 'wifi', 'cellular', 'bluetooth', 'ethernet', 'none', 'unknown', etc.
                  type: connection.type,
                  // Băng thông xuống ước tính (Mbps)
                  downlink: connection.downlink,
                  // Băng thông xuống tối đa (Mbps)
                  downlinkMax: connection.downlinkMax,
                  // Độ trễ vòng lặp ước tính (ms)
                  rtt: connection.rtt,
                  // Chế độ tiết kiệm dữ liệu có bật không
                  saveData: connection.saveData
               }
            }
         }

         // IP Lookup is usually done server-side
         // For privacy and security reasons, we don't make external requests here

         // WebRTC detection (without IP detection)
         this.fingerprint.network.webrtcSupport = {
            // Hỗ trợ kết nối ngang hàng WebRTC
            RTCPeerConnection: 'RTCPeerConnection' in window,
            // Hỗ trợ kênh dữ liệu WebRTC
            RTCDataChannel: 'RTCDataChannel' in window,
            // Hỗ trợ mô tả phiên WebRTC
            RTCSessionDescription: 'RTCSessionDescription' in window
         }
      } catch (e) {
         this.fingerprint.network = { error: e.message }
      }
   }

   // Storage information
   async collectStorageInfo() {
      try {
         this.fingerprint.storage = {
            // Kiểm tra hỗ trợ localStorage (lưu trữ dữ liệu vĩnh viễn ở client)
            localStorage: !!window.localStorage,
            // Kiểm tra hỗ trợ sessionStorage (lưu trữ dữ liệu tạm thời trong phiên làm việc)
            sessionStorage: !!window.sessionStorage,
            // Kiểm tra hỗ trợ indexedDB (cơ sở dữ liệu client-side cho dữ liệu phức tạp)
            indexedDB: !!window.indexedDB,
            // Kiểm tra xem cookies có được bật trong trình duyệt không
            cookiesEnabled: navigator.cookieEnabled
         }

         // Kiểm tra giới hạn lưu trữ
         if (navigator.storage && navigator.storage.estimate) {
            try {
               const estimate = await navigator.storage.estimate()
               this.fingerprint.storage.quota = {
                  // Dung lượng đang sử dụng (tính bằng byte)
                  usage: estimate.usage,
                  // Tổng dung lượng được cấp phát (tính bằng byte)
                  quota: estimate.quota,
                  // Phần trăm dung lượng đã sử dụng so với tổng quota
                  usagePercentage: Math.round(
                     (estimate.usage / estimate.quota) * 100
                  )
               }
            } catch (e) {
               // Thông tin lỗi khi không thể lấy được dữ liệu về quota
               this.fingerprint.storage.quota = { error: e.message }
            }
         }

         // Kiểm tra khả năng lưu trữ vĩnh viễn
         if (navigator.storage && navigator.storage.persisted) {
            try {
               const isPersisted = await navigator.storage.persisted()
               this.fingerprint.storage.persistence = {
                  // Trạng thái lưu trữ vĩnh viễn: true nếu dữ liệu được đảm bảo không bị xóa tự động
                  persisted: isPersisted
               }
            } catch (e) {
               // Thông tin lỗi khi không thể kiểm tra trạng thái lưu trữ vĩnh viễn
               this.fingerprint.storage.persistence = { error: e.message }
            }
         }

         // Kiểm tra hỗ trợ Cache API (dùng để lưu trữ phản hồi từ các request mạng)
         if ('caches' in window) {
            // true nếu trình duyệt hỗ trợ Cache API (thường dùng trong PWA)
            this.fingerprint.storage.cacheAPI = true
         }
      } catch (e) {
         // Thông tin lỗi tổng thể khi không thể lấy dữ liệu về khả năng lưu trữ
         this.fingerprint.storage = { error: e.message }
      }
   }

   // Battery information
   async collectBatteryInfo() {
      try {
         if ('getBattery' in navigator) {
            const battery = await navigator.getBattery()

            this.fingerprint.battery = {
               // Trạng thái sạc pin: true nếu đang sạc, false nếu không sạc
               charging: battery.charging,
               // Thời gian (giây) còn lại để pin sạc đầy, nếu đang sạc (Infinity nếu không xác định)
               chargingTime: battery.chargingTime,
               // Thời gian (giây) còn lại đến khi pin cạn hoàn toàn, nếu đang không sạc (Infinity nếu không xác định)
               dischargingTime: battery.dischargingTime,
               // Mức pin hiện tại, giá trị từ 0.0 (cạn pin) đến 1.0 (pin đầy)
               level: battery.level
            }
         } else {
            // Thông tin nếu API Battery không được hỗ trợ trên thiết bị
            this.fingerprint.battery = { available: false }
         }
      } catch (e) {
         // Thông tin lỗi nếu quá trình thu thập dữ liệu pin gặp sự cố
         this.fingerprint.battery = { error: e.message }
      }
   }

   // Media capabilities
   async collectMediaInfo() {
      try {
         this.fingerprint.media = {
            // Danh sách các định dạng video được hỗ trợ
            videoTypes: [],
            // Danh sách các định dạng âm thanh được hỗ trợ
            audioTypes: [],
            // Kiểm tra xem API mediaDevices có được hỗ trợ không
            mediaDevices: 'mediaDevices' in navigator
         }

         // Check standard media formats
         const videoFormats = [
            // Định dạng MP4 với codec H.264, phổ biến nhất trên web
            'video/mp4; codecs="avc1.42E01E"',
            // Định dạng WebM với codec VP9, độ nén tốt hơn H.264, chất lượng cao
            'video/webm; codecs="vp9"',
            // Định dạng WebM với codec VP8, được hỗ trợ rộng rãi hơn VP9
            'video/webm; codecs="vp8"',
            // Định dạng Ogg với codec Theora, định dạng mã nguồn mở
            'video/ogg; codecs="theora"',
            // Định dạng MP4 với codec HEVC/H.265, hiệu suất nén cao hơn H.264
            'video/mp4; codecs="hev1"',
            // Định dạng MP4 với codec AV1, hiệu suất cao nhất, mã nguồn mở
            'video/mp4; codecs="av01"'
         ]

         const audioFormats = [
            // Định dạng MP4 với codec AAC, chất lượng cao phổ biến
            'audio/mp4; codecs="mp4a.40.2"',
            // Định dạng MP3, được hỗ trợ rộng rãi nhất
            'audio/mpeg',
            // Định dạng WebM với codec Vorbis, mã nguồn mở
            'audio/webm; codecs="vorbis"',
            // Định dạng WebM với codec Opus, chất lượng cao, độ trễ thấp
            'audio/webm; codecs="opus"',
            // Định dạng Ogg với codec FLAC, chất lượng không mất mát
            'audio/ogg; codecs="flac"',
            // Định dạng WAV, không nén, chất lượng nguyên bản
            'audio/wav; codecs="1"'
         ]

         // Check video format support
         for (const format of videoFormats) {
            const support =
               MediaSource && MediaSource.isTypeSupported
                  ? // Kiểm tra hỗ trợ qua API MediaSource (cho phát trực tuyến)
                    MediaSource.isTypeSupported(format)
                  : 'canPlayType' in document.createElement('video')
                  ? // Kiểm tra hỗ trợ qua API HTMLVideoElement
                    document.createElement('video').canPlayType(format) !== ''
                  : 'unknown'

            this.fingerprint.media.videoTypes.push({
               // Định dạng video được kiểm tra
               format,
               // Kết quả kiểm tra: true/false hoặc 'probably'/'maybe'/''
               supported: support
            })
         }

         // Check audio format support
         for (const format of audioFormats) {
            const support =
               MediaSource && MediaSource.isTypeSupported
                  ? // Kiểm tra hỗ trợ qua API MediaSource (cho phát trực tuyến)
                    MediaSource.isTypeSupported(format)
                  : 'canPlayType' in document.createElement('audio')
                  ? // Kiểm tra hỗ trợ qua API HTMLAudioElement
                    document.createElement('audio').canPlayType(format) !== ''
                  : 'unknown'

            this.fingerprint.media.audioTypes.push({
               // Định dạng âm thanh được kiểm tra
               format,
               // Kết quả kiểm tra: true/false hoặc 'probably'/'maybe'/''
               supported: support
            })
         }

         // Check for media capabilities API
         if ('mediaCapabilities' in navigator) {
            // Kiểm tra hỗ trợ API Media Capabilities mới (cho phép xác định khả năng phát lại chi tiết hơn)
            this.fingerprint.media.mediaCapabilitiesAPI = true
         }

         // Enumerate media devices counts (without actual access)
         if (
            navigator.mediaDevices &&
            navigator.mediaDevices.enumerateDevices
         ) {
            try {
               // Liệt kê tất cả thiết bị đa phương tiện mà không yêu cầu quyền truy cập
               const devices = await navigator.mediaDevices.enumerateDevices()
               const deviceTypes = {
                  // Số lượng thiết bị đầu vào âm thanh (microphone)
                  audioInput: 0,
                  // Số lượng thiết bị đầu ra âm thanh (loa, tai nghe)
                  audioOutput: 0,
                  // Số lượng thiết bị đầu vào video (webcam, camera)
                  videoInput: 0
               }

               devices.forEach((device) => {
                  if (device.kind in deviceTypes) {
                     deviceTypes[device.kind]++
                  }
               })

               // Thông tin về số lượng thiết bị đa phương tiện được phát hiện
               this.fingerprint.media.devices = deviceTypes
            } catch (e) {
               // Thông tin lỗi khi không thể truy cập vào danh sách thiết bị
               this.fingerprint.media.devices = { error: e.message }
            }
         }
      } catch (e) {
         // Thông tin lỗi tổng thể khi thu thập thông tin media
         this.fingerprint.media = { error: e.message }
      }
   }

   // Sensor information
   async collectSensors() {
      try {
         this.fingerprint.sensors = {
            // Kiểm tra xem thiết bị có hỗ trợ sự kiện chuyển động hay không (gia tốc và xoay)
            deviceMotion: 'DeviceMotionEvent' in window,
            // Kiểm tra xem thiết bị có hỗ trợ sự kiện định hướng (compass và xoay) hay không
            deviceOrientation: 'DeviceOrientationEvent' in window,
            // Kiểm tra xem thiết bị có hỗ trợ định hướng tuyệt đối (dựa trên từ trường trái đất) hay không
            absoluteOrientation:
               'DeviceOrientationEvent' in window &&
               'absolute' in DeviceOrientationEvent.prototype,
            // Kiểm tra xem thiết bị có hỗ trợ cảm biến gia tốc (phát hiện chuyển động) hay không
            accelerometer: 'Accelerometer' in window,
            // Kiểm tra xem thiết bị có hỗ trợ cảm biến con quay hồi chuyển (phát hiện xoay) hay không
            gyroscope: 'Gyroscope' in window,
            // Kiểm tra xem thiết bị có hỗ trợ cảm biến từ trường (định hướng nam châm) hay không
            magnetometer: 'Magnetometer' in window,
            // Kiểm tra xem thiết bị có hỗ trợ cảm biến ánh sáng môi trường hay không
            ambientLightSensor: 'AmbientLightSensor' in window,
            // Kiểm tra xem trình duyệt có hỗ trợ định vị địa lý hay không
            geolocation: 'geolocation' in navigator,
            // Kiểm tra xem thiết bị có hỗ trợ cảm biến tiệm cận (phát hiện vật thể gần) hay không
            proximity: 'ProximitySensor' in window
         }

         // Check for Sensor API permissions
         if ('permissions' in navigator) {
            try {
               // Only check for accelerometer as an example
               const status = await navigator.permissions.query({
                  name: 'accelerometer'
               })
               // Trạng thái quyền truy cập cảm biến gia tốc: granted (cho phép), denied (từ chối), prompt (hỏi)
               this.fingerprint.sensors.accelerometerPermission = status.state
            } catch (e) {
               // Permission query not supported or denied
               // Ghi nhận lỗi khi kiểm tra quyền truy cập cảm biến
               this.fingerprint.sensors.accelerometerPermission = 'error'
            }
         }
      } catch (e) {
         // Ghi nhận lỗi khi thu thập thông tin cảm biến
         this.fingerprint.sensors = { error: e.message }
      }
   }

   // Navigator properties
   async collectNavigatorProps() {
      try {
         // Collect all non-function properties of the navigator object
         const props = {}
         const navigatorProps = Object.getOwnPropertyNames(navigator)

         for (const prop of navigatorProps) {
            try {
               const value = navigator[prop]

               // Skip functions and complex objects to avoid huge output
               if (
                  typeof value !== 'function' &&
                  typeof value !== 'object' &&
                  prop !== 'plugins' &&
                  prop !== 'mimeTypes'
               ) {
                  // Thu thập các thuộc tính đơn giản của đối tượng navigator
                  props[prop] = value
               }
            } catch (e) {
               // Ghi nhận thuộc tính bị từ chối truy cập vì lý do bảo mật
               props[prop] = 'access denied'
            }
         }

         this.fingerprint.navigatorProps = props

         // Check for user activation features
         if ('userActivation' in navigator) {
            this.fingerprint.navigatorProps.userActivation = {
               // Kiểm tra xem người dùng đã tương tác với trang trong quá khứ chưa
               hasBeenActive: navigator.userActivation.hasBeenActive,
               // Kiểm tra xem người dùng đang tương tác với trang hay không
               isActive: navigator.userActivation.isActive
            }
         }

         // Check for non-standard navigator properties
         const nonStandardProps = [
            'buildID',
            'credentials',
            'keyboard',
            'activeVRDisplays',
            'standalone',
            'wakeLock',
            'virtualKeyboard',
            'canShare'
         ]

         this.fingerprint.navigatorProps.nonStandardSupport = {}

         for (const prop of nonStandardProps) {
            // Kiểm tra hỗ trợ các thuộc tính không chuẩn của trình duyệt
            this.fingerprint.navigatorProps.nonStandardSupport[prop] =
               prop in navigator
         }
      } catch (e) {
         // Ghi nhận lỗi khi thu thập thuộc tính navigator
         this.fingerprint.navigatorProps = { error: e.message }
      }
   }

   // Permissions API
   async collectPermissions() {
      try {
         if (!('permissions' in navigator)) {
            // Ghi nhận nếu API quyền không được hỗ trợ trong trình duyệt
            this.fingerprint.permissions = { supported: false }
            return
         }

         // Ghi nhận rằng API quyền được hỗ trợ và khởi tạo đối tượng lưu trạng thái
         this.fingerprint.permissions = { supported: true, states: {} }

         // Common permission names that can be queried
         const permissionNames = [
            'geolocation',
            'notifications',
            'persistent-storage',
            'push',
            'screen-wake-lock',
            'clipboard-read',
            'clipboard-write',
            'microphone',
            'camera',
            'midi',
            'background-sync',
            'accelerometer',
            'gyroscope',
            'magnetometer',
            'ambient-light-sensor'
         ]

         // Query permissions (without awaiting all to avoid long delays)
         for (const name of permissionNames) {
            try {
               const status = await navigator.permissions.query({ name })
               // Lưu trạng thái quyền: granted (cho phép), denied (từ chối), prompt (hỏi)
               this.fingerprint.permissions.states[name] = status.state
            } catch (e) {
               // Some browsers throw if the permission isn't implemented
               // Ghi nhận quyền không được hỗ trợ trong trình duyệt này
               this.fingerprint.permissions.states[name] = 'unsupported'
            }
         }
      } catch (e) {
         // Ghi nhận lỗi khi thu thập thông tin quyền
         this.fingerprint.permissions = { error: e.message }
      }
   }

   // User behavior data
   async collectBehaviorData() {
      try {
         this.fingerprint.behavior = {
            // Thời gian thu thập dữ liệu theo chuẩn ISO
            timestamp: new Date().toISOString(),
            // Múi giờ của người dùng (ví dụ: Asia/Ho_Chi_Minh, America/New_York)
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // Ngôn ngữ chính được cài đặt trong trình duyệt (ví dụ: vi-VN, en-US)
            language: navigator.language,
            // Danh sách các ngôn ngữ được ưu tiên theo thứ tự
            languages: navigator.languages,
            // Cài đặt không theo dõi (Do Not Track): 1 (bật), 0 (tắt), null (không cài đặt)
            doNotTrack: navigator.doNotTrack,
            // Hướng màn hình: portrait (dọc) hoặc landscape (ngang)
            screenOrientation: screen.orientation
               ? screen.orientation.type
               : 'unknown'
         }

         // Touch support
         if ('ontouchstart' in window) {
            // Số điểm chạm tối đa trên màn hình cảm ứng
            this.fingerprint.behavior.touchPoints =
               navigator.maxTouchPoints || 0
         } else {
            // Thiết bị không hỗ trợ cảm ứng
            this.fingerprint.behavior.touchPoints = 0
         }

         // Check for automation signals
         this.fingerprint.behavior.automation = {
            // Phát hiện webdriver (Selenium, Chrome DevTools Protocol)
            webdriver: navigator.webdriver ? true : false,
            // Phát hiện Selenium
            selenium: !!window.document.selenium,
            // Phát hiện tự động hóa Chrome
            documentAutomation: !!window.document.$chrome_asyncScriptInfo,
            // Phát hiện tự động hóa DOM
            domAutomation: !!window.domAutomation,
            // Phát hiện công cụ tự động hóa bên ngoài
            external:
               !!window.external &&
               !!window.external.toString &&
               window.external.toString().indexOf('Sequentum') > -1,
            // Phát hiện PhantomJS
            phantom:
               typeof window.callPhantom === 'function' || !!window._phantom,
            // Phát hiện NightmareJS
            nightmareJS: !!window.__nightmare,
            // Phát hiện trình duyệt có đối tượng chrome
            hasChrome: !!window.chrome,
            // Phát hiện khả năng cài đặt từ Chrome Web Store
            chromeWebstoreInstall:
               typeof chrome !== 'undefined' &&
               chrome !== null &&
               typeof chrome.webstore !== 'undefined' &&
               chrome.webstore !== null
         }
      } catch (e) {
         // Ghi nhận lỗi khi thu thập dữ liệu hành vi người dùng
         this.fingerprint.behavior = { error: e.message }
      }
   }

   // Generate a hash from a string
   hashString(str) {
      if (!str || typeof str !== 'string') {
         return 'invalid_input'
      }

      let hash = 0
      for (let i = 0; i < str.length; i++) {
         const char = str.charCodeAt(i)
         hash = (hash << 5) - hash + char
         hash = hash & hash // Convert to 32bit integer
      }

      // Convert to a positive hex string
      return (hash >>> 0).toString(16)
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
         }

         // Generate hash from stable props
         const jsonString = JSON.stringify(stableProps)
         return this.hashString(jsonString)
      } catch (e) {
         console.error('Error generating fingerprint hash:', e)
         return this.hashString(navigator.userAgent + Date.now())
      }
   }
}

// Export the class for use in other modules
export { BrowserFingerprint }
