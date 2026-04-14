let axios = require('axios')
let BodyForm = require('form-data')
let { fromBuffer } = require('file-type')
let fetch = require('node-fetch')
let fs = require('fs')
let cheerio = require('cheerio')

function TelegraPh(Path) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(Path)) return reject(new Error('File not Found'))
        try {
            const form = new BodyForm()
            form.append('file', fs.createReadStream(Path))
            const data = await axios({
                url: 'https://telegra.ph/upload',
                method: 'POST',
                headers: {
                    ...form.getHeaders()
                },
                data: form
            })
            return resolve('https://telegra.ph' + data.data[0].src)
        } catch (err) {
            return reject(new Error(String(err)))
        }
    })
}

async function UploadFileUgu(input) {
    return new Promise(async (resolve, reject) => {
        const form = new BodyForm()
        form.append('files[]', fs.createReadStream(input))
        await axios({
            url: 'https://uguu.se/upload.php',
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                ...form.getHeaders()
            },
            data: form
        }).then((data) => {
            resolve(data.data.files[0])
        }).catch((err) => reject(err))
    })
}

function webp2mp4File(path) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) return reject(new Error('File not Found'))

        const form = new BodyForm()
        form.append('new-image-url', '')
        form.append('new-image', fs.createReadStream(path))
        form.append('upload', 'Upload!')

        axios({
            method: 'post',
            url: 'https://ezgif.com/webp-to-mp4',
            data: form,
            maxRedirects: 5,
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0'
            }
        }).then(({ data }) => {
            const $ = cheerio.load(data)
            const file = $('input[name="file"]').attr('value')
            const action = $('form.ajax-form').attr('action') || ('https://ezgif.com/webp-to-mp4/' + file)

            if (!file) {
                return reject(new Error('Failed to upload sticker to ezgif'))
            }

            const bodyFormThen = new BodyForm()
            bodyFormThen.append('file', file)
            bodyFormThen.append('background', '#ffffff')
            bodyFormThen.append('repeat', '1')
            bodyFormThen.append('convert', 'Convert WebP to MP4!')

            axios({
                method: 'post',
                url: action,
                data: bodyFormThen,
                maxRedirects: 5,
                headers: {
                    ...bodyFormThen.getHeaders(),
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': action
                }
            }).then(({ data }) => {
                const $ = cheerio.load(data)
                const src =
                    $('div#output > p.outfile > video > source').attr('src') ||
                    $('div#output video source').attr('src') ||
                    $('video source').attr('src')

                if (!src) {
                    return reject(new Error('Failed to get converted mp4 URL'))
                }

                const result = src.startsWith('http') ? src : 'https:' + src

                resolve({
                    status: true,
                    message: 'success',
                    result
                })
            }).catch(reject)
        }).catch(reject)
    })
}

async function floNime(medianya, options = {}) {
    const fileType = await fromBuffer(medianya)
    const ext = fileType?.ext || options.ext || 'bin'
    const form = new BodyForm()
    form.append('file', medianya, 'tmp.' + ext)
    let jsonnya = await fetch('https://flonime.my.id/upload', {
        method: 'POST',
        body: form
    }).then((response) => response.json())
    return jsonnya
}

module.exports = { TelegraPh, UploadFileUgu, webp2mp4File, floNime }