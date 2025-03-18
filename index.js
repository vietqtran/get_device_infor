const express = require('express')
const { JSDOM } = require('jsdom')
const cors = require('cors')
const app = express()
const port = 3000

const corsOptions = {
   origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
   methods: ['GET', 'POST', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true,
   optionsSuccessStatus: 200
}

// Áp dụng CORS cho toàn bộ ứng dụng
app.use(cors(corsOptions))

app.get('/', async (req, res) => {
   try {
      // Tạo một môi trường DOM ảo vì chúng ta đang ở môi trường Node.js
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
         url: 'http://localhost',
         runScripts: 'dangerously',
         resources: 'usable'
      })

      const window = dom.window
      const document = window.document
      const navigator = window.navigator

      // Khởi tạo đối tượng để lưu thông tin
      const systemInfo = {
         userAgent: req.headers['user-agent'] || 'Không khả dụng',
         screenResolution: 'Không khả dụng trong Node.js (chỉ có ở client)',
         timezoneOffset: new Date().getTimezoneOffset(),
         language: req.headers['accept-language'] || 'Không khả dụng',
         deviceMemory: 'Không khả dụng trong Node.js (chỉ có ở client)',
         hardwareConcurrency: 'Không khả dụng trong Node.js (chỉ có ở client)',
         webGLVendor: 'Không khả dụng trong Node.js (chỉ có ở client)',
         webGLRenderer: 'Không khả dụng trong Node.js (chỉ có ở client)',
         canvasData: 'Không khả dụng trong Node.js (chỉ có ở client)',
         ip: req.ip || req.connection.remoteAddress,
         headers: req.headers
      }

      // Trả về thông tin dưới dạng JSON
      res.json({
         status: 'success',
         message: 'Thông tin hệ thống',
         data: systemInfo
      })
   } catch (error) {
      res.status(500).json({
         status: 'error',
         message: 'Đã xảy ra lỗi khi thu thập thông tin',
         error: error.message
      })
   }
})

// API cung cấp client-side script để thu thập thông tin đầy đủ từ trình duyệt
app.get('/client-script', (req, res) => {
   const clientScript = `
    function collectBrowserInfo() {
      const info = {};
      
      // User Agent
      info.userAgent = navigator.userAgent;
      
      // Screen Resolution
      info.screenWidth = window.screen.width;
      info.screenHeight = window.screen.height;
      
      // Timezone
      info.timezoneOffset = new Date().getTimezoneOffset();
      
      // Language
      info.language = navigator.language;
      
      // Canvas Fingerprinting
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Hello, World!", 2, 15);
        info.canvasData = canvas.toDataURL().substring(0, 100) + "..."; // Chỉ lấy phần đầu để tránh dữ liệu quá dài
      } catch (e) {
        info.canvasData = "Không khả dụng: " + e.message;
      }
      
      // WebGL
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          info.webGLVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "Không khả dụng";
          info.webGLRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Không khả dụng";
        } else {
          info.webGLVendor = "WebGL không khả dụng";
          info.webGLRenderer = "WebGL không khả dụng";
        }
      } catch (e) {
        info.webGLVendor = "Lỗi: " + e.message;
        info.webGLRenderer = "Lỗi: " + e.message;
      }
      
      // Device Memory
      info.deviceMemory = navigator.deviceMemory || "Không khả dụng";
      
      // Hardware Concurrency
      info.hardwareConcurrency = navigator.hardwareConcurrency || "Không khả dụng";
      
      return info;
    }
    
    // Gửi thông tin về server
    function sendInfoToServer() {
      const info = collectBrowserInfo();
      fetch('/submit-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(info)
      })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => console.error('Error:', error));
      
      // Hiển thị thông tin trên trang
      document.getElementById('info-display').innerHTML = 
        '<pre>' + JSON.stringify(info, null, 2) + '</pre>';
    }
  `

   res.setHeader('Content-Type', 'application/javascript')
   res.send(clientScript)
})

// API nhận thông tin từ client
app.use(express.json())
app.post('/submit-info', (req, res) => {
   console.log('Nhận thông tin từ client:', req.body)
   res.json({
      status: 'success',
      message: 'Đã nhận thông tin'
   })
})

// API nhận dữ liệu fingerprint từ client
app.post('/submit-fingerprint', (req, res) => {
   console.log('Đã nhận fingerprint từ client');
   
   try {
      const fingerprint = req.body;
      
      // Có thể lưu fingerprint vào database hoặc xử lý tiếp
      // Ở đây chỉ gửi lại phản hồi đơn giản
      
      res.json({
         status: 'success',
         message: 'Đã nhận fingerprint thành công',
         fingerprintId: fingerprint.fingerprintId || 'Không có ID',
         timestamp: new Date().toISOString()
      });
   } catch (error) {
      res.status(500).json({
         status: 'error',
         message: 'Lỗi khi xử lý fingerprint',
         error: error.message
      });
   }
});

// Phục vụ tệp BrowserFingerprint.js dưới dạng module ES6
app.get('/BrowserFingerprint.js', (req, res) => {
   res.setHeader('Content-Type', 'application/javascript');
   res.sendFile(__dirname + '/BrowserFingerprint.js');
});

// Phục vụ tệp fingerprint-client.js
app.get('/fingerprint-client.js', (req, res) => {
   res.setHeader('Content-Type', 'application/javascript');
   res.sendFile(__dirname + '/fingerprint-client.js');
});

// Trang HTML demo
app.get('/demo', (req, res) => {
   const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Thu thập thông tin thiết bị</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      button { padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
      #info-display { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    </style>
  </head>
  <body>
    <h1>Thu thập thông tin thiết bị</h1>
    <p>Nhấn nút bên dưới để thu thập và hiển thị thông tin về thiết bị của bạn.</p>
    <button onclick="sendInfoToServer()">Thu thập thông tin</button>
    <div id="info-display">Thông tin sẽ hiển thị ở đây...</div>
    <script src="/client-script"></script>
  </body>
  </html>
  `

   res.send(html)
})

app.listen(port, () => {
   console.log(`Server đang chạy tại http://localhost:${port}`)
})
