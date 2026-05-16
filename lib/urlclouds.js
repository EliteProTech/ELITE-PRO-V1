const fs = require('fs-extra');
const path = require("path");
const axios = require('axios');
const FormData = require('form-data');

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

async function uploadToEliteTempUrl(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found.");
  }

  const form = new FormData();

  form.append(
    "files[]",
    fs.createReadStream(filePath)
  );

  const res = await axios.post(
    "https://uguu.se/upload",
    form,
    {
      headers: form.getHeaders()
    }
  );

  if (!res.data.success || !res.data.files?.length) {
    throw new Error("Upload failed");
  }

  return res.data.files[0].url;
}
 
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
