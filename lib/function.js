'use strict'
const fs = require('fs')
const axios = require('axios')
const FileType = require('file-type')
const FormData = require('form-data')

exports.isUrl = url => url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))

exports.getBuffer = async (url) => {
	if (!exports.isUrl(url)) throw 'Invalid url!'
	let res = await axios.get(url, { responseType: 'arraybuffer' })
	return res.data
}

exports.color = (text, color) => {
	switch (color) {
		case 'black': return '\u001b[30m' + text + '\u001b[39m'
		case 'red': return '\u001b[91m' + text + '\u001b[39m'
		case 'darkRed': return '\u001b[31m' + text + '\u001b[39m'
		case 'green': return '\u001b[92m' + text + '\u001b[39m'
		case 'darkGreen': return '\u001b[32m' + text + '\u001b[39m'
		case 'yellow': return '\u001b[93m' + text + '\u001b[39m'
		case 'darkYellow': return '\u001b[33m' + text + '\u001b[39m'
		case 'blue': return '\u001b[94m' + text + '\u001b[39m'
		case 'darkBlue': return '\u001b[34m' + text + '\u001b[39m'
		case 'purple': return '\u001b[95m' + text + '\u001b[39m'
		case 'darkPurple': return '\u001b[35m' + text + '\u001b[39m'
		case 'cyan': return '\u001b[96m' + text + '\u001b[39m'
		case 'darkCyan': return '\u001b[36m' + text + '\u001b[39m'
		default: return '\u001b[90m' + text + '\u001b[39m'
	}
}

exports.bgColor = (text, color) => {
	switch (color) {
		case 'black': return '\u001b[40m' + text + '\u001b[49m'
		case 'red': return '\u001b[101m' + text + '\u001b[49m'
		case 'darkRed': return '\u001b[41m' + text + '\u001b[49m'
		case 'green': return '\u001b[102m' + text + '\u001b[49m'
		case 'darkGreen': return '\u001b[42m' + text + '\u001b[49m'
		case 'yellow': return '\u001b[103m' + text + '\u001b[49m'
		case 'darkYellow': return '\u001b[43m' + text + '\u001b[49m'
		case 'blue': return '\u001b[104m' + text + '\u001b[49m'
		case 'darkBlue': return '\u001b[44m' + text + '\u001b[49m'
		case 'purple': return '\u001b[105m' + text + '\u001b[49m'
		case 'darkPurple': return '\u001b[45m' + text + '\u001b[49m'
		case 'cyan': return '\u001b[106m' + text + '\u001b[49m'
		case 'darkCyan': return '\u001b[46m' + text + '\u001b[49m'
		default: return '\u001b[100m' + text + '\u001b[49m'
	}
}

exports.pickRandom = (arr) => {
	if (typeof arr == 'number') return Math.floor(Math.random() * arr)
	else return arr[Math.floor(Math.random() * arr.length)]
}

exports.formatBytes = (bytes, decimals = 2) => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = [' Bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

exports.clockString = (ms) => {
	let h = isNaN(ms) ? '--' : Math.floor(ms % (3600 * 24) / 3600)
	let m = isNaN(ms) ? '--' : Math.floor(ms % 3600 / 60)
	let s = isNaN(ms) ? '--' : Math.floor(ms % 60)
	return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

exports.parseMs = (ms) => {
	if (typeof ms !== 'number') throw 'Parameter must be filled with number'
	return {
		days: Math.trunc(ms / 86400000),
		hours: Math.trunc(ms / 3600000) % 24,
		minutes: Math.trunc(ms / 60000) % 60,
		seconds: Math.trunc(ms / 1000) % 60,
		milliseconds: Math.trunc(ms) % 1000,
		microseconds: Math.trunc(ms * 1000) % 1000,
		nanoseconds: Math.trunc(ms * 1e6) % 1000
	}
}

exports.parseResult = (json, options = {}) => {
	// github: https://github.com/Zobin33/Anu-Wabot/blob/master/lib/functions.js#L81
	let opts = {
		unicode: true,
		ignoreVal: [null, undefined],
		ignoreKey: [],
		title: conn.user.name,
		headers: `%title\n`,
		body: `• *%key*: %value`,
		footer: '\n',
		...options
	}
	let { unicode, ignoreKey, title, headers, ignoreVal, body, footer } = opts
	let obj = Object.entries(json)
	let tmp = []
	for (let [_key, val] of obj) {
		if (ignoreVal.indexOf(val) !== -1) continue
		let key = _key[0].toUpperCase() + _key.slice(1)
		let type = typeof val
		if (ignoreKey && ignoreKey.includes(_key)) continue
		switch (type) {
			case 'boolean':
			tmp.push([key, val ? 'Ya' : 'Tidak'])
			break
			case 'object':
			if (Array.isArray(val)) tmp.push([key, val.join(', ')])
			else tmp.push([key, exports.parseResult(val, { ignoreKey, unicode: false }), ])
			break
			default:
			tmp.push([key, val])
			break
		}
	}
	if (unicode) {
		let text = [
			headers.replace(/%title/g, title), tmp.map((v) => {
				return body.replace(/%key/g, v[0]).replace(/%value/g, v[1])
			}).join('\n'), footer
		]
		return text.join('\n').trim()
	}
	return tmp
}

exports.convertSticker = (file, stickerMetadata) => {
	return new Promise(async (resolve, reject) => {
		if (stickerMetadata) {
			if (!stickerMetadata.author) stickerMetadata.author = '‎'
			if (!stickerMetadata.pack) stickerMetadata.pack = '‎'
			stickerMetadata.keepScale = (stickerMetadata.keepScale !== undefined) ? stickerMetadata.keepScale : false
			stickerMetadata.circle = (stickerMetadata.circle !== undefined) ? stickerMetadata.circle : false
		} else if (!stickerMetadata) {
			stickerMetadata = {
				author: '‎',
				pack: '‎',
				keepScale: false,
				circle: false,
				removebg: 'HQ'
			}
		}
		let getBase64 = Buffer.isBuffer(file) ? file.toString('base64') : (typeof file === 'string' && fs.existsSync(file)) ? fs.readFileSync(file).toString('base64') : null
		if (!getBase64) return reject('File Base64 Undefined')
		const Format = {
			image: `data:image/jpeg;base64,${getBase64}`,
			stickerMetadata: {
				...stickerMetadata
			},
			sessionInfo: {
				WA_VERSION: '2.2106.5',
				PAGE_UA: 'WhatsApp/2.2037.6 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
				WA_AUTOMATE_VERSION: '3.6.10 UPDATE AVAILABLE: 3.6.11',
				BROWSER_VERSION: 'HeadlessChrome/88.0.4324.190',
				OS: 'Windows Server 2016',
				START_TS: 1614310326309,
				NUM: '6247',
				LAUNCH_TIME_MS: 7934,
				PHONE_VERSION: '2.20.205.16'
			},
			config: {
				sessionId: 'session',
				headless: true,
				qrTimeout: 20,
				authTimeout: 0,
				cacheEnabled: false,
				useChrome: true,
				killProcessOnBrowserClose: true,
				throwErrorOnTosBlock: false,
				chromiumArgs: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--aggressive-cache-discard',
					'--disable-cache',
					'--disable-application-cache',
					'--disable-offline-load-stale-cache',
					'--disk-cache-size=0'
				],
				executablePath: 'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
				skipBrokenMethodsCheck: true,
				stickerServerEndpoint: true
			}
		}
		await axios({
			url: 'https://sticker-api-tpe3wet7da-uc.a.run.app/prepareWebp',
			method: 'post',
			headers: {
				Accept: 'application/json, text/plain, /',
				'Content-Type': 'application/json;charset=utf-8',
			},
			data: JSON.stringify(Format)
		}).then(({ data }) => {
			return resolve(Buffer.from(data.webpBase64, 'base64'))
		}).catch((err) => reject(err))
	})
}

exports.mp4ToWebp = (file, stickerMetadata) => {
	return new Promise(async (resolve, reject) => {
		if (stickerMetadata) {
			if (!stickerMetadata.author) stickerMetadata.author = '‎'
			if (!stickerMetadata.pack) stickerMetadata.pack = '‎'
		} else if (!stickerMetadata) {
			stickerMetadata = {
				author: '‎',
				pack: '‎'
			}
		}
		let getBase64 = Buffer.isBuffer(file) ? file.toString('base64') : (typeof file === 'string' && fs.existsSync(file)) ? fs.readFileSync(file).toString('base64') : null
		if (!getBase64) return reject('File Base64 undefined')
		const Format = {
			file: `data:video/mp4;base64,${getBase64}`,
			processOptions: {
				crop: (stickerMetadata.crop !== undefined) ? stickerMetadata.crop : false,
				startTime: '00:00:00.0',
				endTime: '00:00:7.0',
				loop: 0
			},
			stickerMetadata: {
				...stickerMetadata
			},
			sessionInfo: {
				WA_VERSION: '2.2106.5',
				PAGE_UA: 'WhatsApp/2.2037.6 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
				WA_AUTOMATE_VERSION: '3.6.10 UPDATE AVAILABLE: 3.6.11',
				BROWSER_VERSION: 'HeadlessChrome/88.0.4324.190',
				OS: 'Windows Server 2016',
				START_TS: 1614310326309,
				NUM: '6247',
				LAUNCH_TIME_MS: 7934,
				PHONE_VERSION: '2.20.205.16'
			},
			config: {
				sessionId: 'session',
				headless: true,
				qrTimeout: 20,
				authTimeout: 0,
				cacheEnabled: false,
				useChrome: true,
				killProcessOnBrowserClose: true,
				throwErrorOnTosBlock: false,
				chromiumArgs: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--aggressive-cache-discard',
					'--disable-cache',
					'--disable-application-cache',
					'--disable-offline-load-stale-cache',
					'--disk-cache-size=0'
				],
				executablePath: 'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
				skipBrokenMethodsCheck: true,
				stickerServerEndpoint: true
			 }
		}
		await axios({
			url: 'https://sticker-api.openwa.dev/convertMp4BufferToWebpDataUrl',
			method: 'post',
			headers: {
				Accept: 'application/json, text/plain, /',
				'Content-Type': 'application/json;charset=utf-8',
			},
			data: JSON.stringify(Format)
		}).then(({ data }) => {
			return resolve(Buffer.from(data.split(';base64,')[1], 'base64'))
		}).catch((err) => reject(err))
	})
}

exports.uploadImage = async (buffer) => {
	let { ext } = await FileType.fromBuffer(buffer)
	let form = new FormData
	form.append('file', buffer, 'tmp.' + ext)
	let res = await axios({
		url: 'https://telegra.ph/upload',
		method: 'post',
		data: form,
		headers: {
			'Content-Type': `multipart/form-data; boundary=${form._boundary}`
		}
	})
	let img = res.data
	if (img.error) throw img.error
	return 'https://telegra.ph' + img[0].src
}

exports.uploadFile = async (buffer) => {
	let { ext } = await FileType.fromBuffer(buffer)
	let form = new FormData
	form.append('file', buffer, 'tmp.' + ext)
	let res = await axios({
		url: 'https://upload.ichikaa.xyz/upload',
		method: 'post',
		data: form,
		headers: {
			'Content-Type': `multipart/form-data; boundary=${form._boundary}`
		}
	})
	let img = res.data
	if (img.error) throw img.error
	return img.result.url
}
