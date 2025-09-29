const axios = require('axios');
const FormData = require('form-data');

const appmaker = {
  defaultHeaders: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'sec-ch-ua-platform': '"Android"',
    'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    'dnt': '1',
    'sec-ch-ua-mobile': '?1',
    'origin': 'https://create.appmaker.xyz',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://create.appmaker.xyz/',
    'accept-language': 'id,en-US;q=0.9,en;q=0.8,ja;q=0.7',
    'priority': 'u=1, i'
  },

  createApp: async (url, email) => {
    try {
      const data = JSON.stringify({ url: url, email: email });
      const config = {
        method: 'POST',
        url: 'https://standalone-app-api.appmaker.xyz/webapp/build',
        headers: {
          ...appmaker.defaultHeaders,
          'Content-Type': 'application/json',
          'content-type': 'application/json;charset=UTF-8'
        },
        data: data
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadFileFromBuffer: async (buffer, appId, filename) => {
    try {
      const data = new FormData();
      data.append('file', buffer, {
        filename: filename,
        contentType: 'image/png'
      });
      data.append('id', appId);
      
      const config = {
        method: 'POST',
        url: 'https://standalone-app-api.appmaker.xyz/webapp/build/file-upload',
        headers: {
          ...appmaker.defaultHeaders,
          ...data.getHeaders()
        },
        data: data
      };
      
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  buildApp: async (appConfig) => {
    try {
      const data = JSON.stringify(appConfig);
      const config = {
        method: 'POST',
        url: 'https://standalone-app-api.appmaker.xyz/webapp/build/build',
        headers: {
          ...appmaker.defaultHeaders,
          'Content-Type': 'application/json',
          'content-type': 'application/json;charset=UTF-8'
        },
        data: data
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkStatus: async (appId) => {
    try {
      const config = {
        method: 'GET',
        url: `https://standalone-app-api.appmaker.xyz/webapp/build/status?appId=${appId}`,
        headers: {
          ...appmaker.defaultHeaders,
          'if-none-match': 'W/"16f-VVclKRvUNSgEIOI1Ys1wn2XnTxM"'
        }
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDownloadUrl: async (appId) => {
    try {
      const config = {
        method: 'GET',
        url: `https://standalone-app-api.appmaker.xyz/webapp/complete/download?appId=${appId}`,
        headers: appmaker.defaultHeaders
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Endpoint untuk membuat aplikasi
module.exports = [{
  name: "Start Builder",
  desc: "Konvert Web to app",
  category: "ToApp",
  path: "/tools/toapp/create?url=&email=&appName=&appIcon=&splashIcon=",
  async run(req, res) {
    const { url, email, appName, appIcon, splashIcon, toolbarColor, toolbarTitleColor, enableShowToolBar } = req.query;
    
    if (!url || !email || !appName || !appIcon) {
      return res.json({ 
        status: false, 
        error: "Parameter wajib: url, email, appName, appIcon" 
      });
    }

    try {
      // Step 1: Create app
      const createResult = await appmaker.createApp(url, email);
      const appId = createResult.body.appId;

      // Step 2: Download dan upload app icon langsung dari buffer
      const appIconResponse = await axios({
        method: 'GET',
        url: appIcon,
        responseType: 'arraybuffer'
      });
      
      const appIconUpload = await appmaker.uploadFileFromBuffer(
        appIconResponse.data, 
        appId, 
        `appIcon_${appId}.png`
      );
      const appIconUrl = appIconUpload.cloudStoragePublicUrl;
      let splashIconUrl = appIconUrl;
      
      if (splashIcon) {
        const splashIconResponse = await axios({
          method: 'GET',
          url: splashIcon,
          responseType: 'arraybuffer'
        });
        
        const splashIconUpload = await appmaker.uploadFileFromBuffer(
          splashIconResponse.data, 
          appId, 
          `splashIcon_${appId}.png`
        );
        splashIconUrl = splashIconUpload.cloudStoragePublicUrl;
      }

      const appConfig = {
        appId: appId,
        appIcon: appIconUrl,
        appName: appName,
        isPaymentInProgress: false,
        enableShowToolBar: enableShowToolBar || false,
        toolbarColor: toolbarColor || "#03A9F4",
        toolbarTitleColor: toolbarTitleColor || "#FFFFFF",
        splashIcon: splashIconUrl
      };

      await appmaker.buildApp(appConfig);

      res.json({
        status: true,
        message: "App creation started successfully",
        appId: appId,
        details: "Use the checkStatus endpoint with this appId to monitor progress"
      });

    } catch (error) {
      res.status(500).json({ 
        status: false, 
        error: error.message 
      });
    }
  }
},
{
  name: "Status Build",
  desc: "Melihat status builder dari appid",
  category: "ToApp",
  path: "/tools/toapp/status?appId=",
  async run(req, res) {
    const { appId } = req.query;
    
    if (!appId) {
      return res.json({ 
        status: false, 
        error: "Parameter appId wajib" 
      });
    }

    try {
      const status = await appmaker.checkStatus(appId);
      res.json({
        status: true,
        appId: appId,
        buildStatus: status.body.status,
        details: status.body
      });
    } catch (error) {
      res.status(500).json({ 
        status: false, 
        error: error.message 
      });
    }
  }
},
{
  name: "Download Hasil Apk",
  desc: "Download built app with appid",
  category: "ToApp",
  path: "/tools/toapp/download?appId=",
  async run(req, res) {
    const { appId } = req.query;
    
    if (!appId) {
      return res.json({ 
        status: false, 
        error: "Parameter appId wajib" 
      });
    }

    try {
      const downloadInfo = await appmaker.getDownloadUrl(appId);
      
      if (downloadInfo.body.status === 'success') {
        res.json({
          status: true,
          appId: appId,
          downloadUrl: downloadInfo.body.buildFile,
          aabFile: downloadInfo.body.aabFile,
          keyFile: downloadInfo.body.keyFile,
          storePass: downloadInfo.body.storePass,
          keyPass: downloadInfo.body.keyPass,
          keySha: downloadInfo.body.keySha,
          sourceFile: downloadInfo.body.sourceFile,
          appIcon: downloadInfo.body.appIcon,
          appName: downloadInfo.body.appName,
          packageName: downloadInfo.body.package_name
        });
      } else {
        res.json({
          status: false,
          appId: appId,
          error: "App not ready for download",
          details: downloadInfo.body
        });
      }
    } catch (error) {
      res.status(500).json({ 
        status: false, 
        error: error.message 
      });
    }
  }
}];
        
