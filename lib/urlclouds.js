const fs = require('fs-extra');
const path = require("path");
const axios = require('axios');
const FormData = require('form-data');

// EliteProTech-Cloud Storage
async function uploadToEliteProTechUrl(filePath) {
  if (!filePath) throw new Error("No file provided for upload.");
  if (!fs.existsSync(filePath)) throw new Error("File not found.");
  
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  
  const res = await axios.post("https://eliteprotech-url.zone.id/api/upload", form, {
    headers: form.getHeaders()
  });
  
  if (!res.data.success) throw new Error(res.data.error || "Upload failed");
  
  return res.data.public_url;
}

// EliteProTech Temporary Storage 
async function uploadToEliteTempUrl(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("File not found.");
  
  const ext = path.extname(filePath) || ".bin";
  const finalFilename = `A1k7n${ext}`;
  
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), finalFilename);
  
  const res = await axios.post("https://eliteprotech-tempurl.zone.id/tempurl", form, {
    headers: form.getHeaders()
  });
  
  if (!res.data.success) throw new Error(res.data.error || "Upload failed");
  
  return res.data.url;
}

// Catbox Storage 
async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("File not found.");
  
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', fs.createReadStream(filePath));
  
  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders()
  });
  
  return res.data.trim();
}

module.exports = {
  uploadToEliteProTechUrl,
  uploadToEliteTempUrl,
  uploadToCatbox
};
