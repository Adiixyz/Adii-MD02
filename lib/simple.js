'use strict'
const { clockString, convertSticker, mp4ToWebp } = require('./function.js')
const Baileys = require('@adiwajshing/baileys-md')
const FileType = require('file-type')
const axios = require('axios')
const util = require('util')
const os = require('os')
const fs = require('fs')

exports.makeWASocket = (...args) => {
	let conn = Baileys.default(...args)
	if (conn.user && conn.user.id) conn.user.jid = Baileys.jidNormalizedUser(conn.user.id)
	
	conn.ev.on('messages.upsert', m => {
		m = m.messages[0]
		let type = m.messageStubType
		let participants = m.messageStubParameters
		switch (type) {
			case 27: case 28: case 29: case 30: case 32:
			conn.ev.emit('group-update', { m, jid: m.key.remoteJid, type: Baileys.WAMessageStubType[type], participants })
			break
		}
	})
	/*
	conn.chats = []
	async function updateParticipantsToDb(m) {
		let { from, participant, t, notify } = m.attrs
		if (Baileys.isJidBroadcast(from)) return
		let jid = Baileys.isJidGroup(from) ? participant : from
		let id = conn.chats.map(v => v.jid)
		if (!id.includes(from) && Baileys.isJidGroup(from)) conn.chats.push({ jid: from, name: (await conn.groupMetadata(from)).subject, t, metadata: await conn.groupMetadata(from), imgUrl: await conn.profilePictureUrl(from, 'image').catch(() => null) })
		else if ((!id.includes(from) || !id.includes(jid)) && (notify !== undefined)) conn.chats.push({ jid, name: notify, t, imgUrl: await conn.profilePictureUrl(jid, 'image').catch(() => null) })
	}
	conn.ws.on('CB:message', updateParticipantsToDb)
	conn.ws.on('CB:notification', updateParticipantsToDb)
	*/
	conn.getGroupAdmins = async (jid) => {
		if (!jid.endsWith('@g.us')) throw `${jid} is Not a Group!`
		let admins = []
		let { participants } = await conn.groupMetadata(jid)
		participants.map((x) => {
			x.admin !== null ? admins.push(x.id) : ''
		})
		return admins
	}
	
	conn.getFile = async (path) => {
		let res
		let data = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? (res = await axios.get(path, { responseType: 'arraybuffer' })).data : fs.existsSync(path) ? fs.readFileSync(path) : typeof path === 'string' ? path : Buffer.alloc(0)
		if (!Buffer.isBuffer(data)) throw 'Result is not a buffer'
		let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' }
		return { res, ...type, data }
	}
	
	conn.sendFile = async (jid, path, fileName = '', caption = '', quoted, options = {}) => {
		let type = await conn.getFile(path)
		let { res, data } = type
		if (res && res.status !== 200 || data.length <= 65536) {
			try { throw { json: JSON.parse(data.toString()) } }
			catch (e) { if (e.json) throw e.json }
		}
		let opt = { fileName }
		if (quoted) opt.quoted = quoted
		let mtype = '', mimetype = options.mimetype || type.mime
		if (!type || options.asDocument) mtype = 'document'
		else if (/webp/.test(type.mime)) mtype = 'sticker'
		else if (/image/.test(type.mime)) mtype = 'image'
		else if (/video/.test(type.mime)) mtype = 'video'
		else if (/audio/.test(type.mime)) mtype = 'audio'
		else mtype = 'document'
		return await conn.sendMessage(jid, { ...opt, ...options, [mtype]: data, mimetype, caption }, { ...opt, ...options })
	}
	
	conn.reply = (jid, text, quoted = null, opt) => {
		return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, opt) : conn.sendMessage(jid, { text: util.format(text), ...opt }, { quoted, ...opt })
	}
	
	conn.sendSticker = async (jid, path, quoted = null, opt = {}) => {
		let { mime, data } = await conn.getFile(path)
		let stc
		try {
			if (/image/.test(mime)) stc = await convertSticker(data, { author: opt.author, pack: opt.pack, keepScale: opt.keepScale, circle: opt.circle })
			else if (/video/.test(mime)) stc = await mp4ToWebp(data, { author: opt.author, pack: opt.pack, crop: opt.crop })
		} catch (e) {
			stc = e
		} finally {
			conn.reply(jid, stc, quoted)
		}
	}
	
	conn.sendContact = async (jid, number, name, quoted, opt = {}) => {
		number = number.replace(/\D/g, '')
		let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;waid=${number}:${number}\nEND:VCARD`.trim()
		return await conn.sendMessage(jid, { contacts: { displayName: name, contacts: [{ vcard }] }, ...opt }, { quoted })
	}
	
	conn.updateProfilePicture = async (jid, content) => {
		const { img } = await generateProfilePicture(content)
		await conn.query({
			tag: 'iq',
			attrs: {
				to: Baileys.jidNormalizedUser(jid),
				type: 'set',
				xmlns: 'w:profile:picture'
			},
			content: [
				{
					tag: 'picture',
					attrs: { type: 'image' },
					content: img
				}
			]
		})
	}
	
	conn.downloadM = async (m, type, filename = '') => {
		if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
		const stream = await Baileys.downloadContentFromMessage(m, type)
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		if (filename) await fs.promises.writeFile(filename, buffer)
		return filename && fs.existsSync(filename) ? filename : buffer
	}
	
	conn.parseMention = (text = '') => {
		return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
	}
	
	return conn
}


async function generateProfilePicture(mediaUpload) {
	let bufferOrFilePath
	if (Buffer.isBuffer(mediaUpload)) {
		bufferOrFilePath = mediaUpload
	}
	else if ('url' in mediaUpload) {
		bufferOrFilePath = mediaUpload.url.toString()
	}
	else {
		bufferOrFilePath = await Baileys.toBuffer(mediaUpload.stream)
	}
	const { read, MIME_JPEG, AUTO } = await Promise.resolve().then(() => require('jimp'))
	const jimp = await read(bufferOrFilePath)
	const min = jimp.getWidth()
	const max = jimp.getHeight()
	const cropped = jimp.crop(0, 0, min, max)
	return {
		img: await cropped
			.quality(95)
			.scaleToFit(720, 720, AUTO)
			.getBufferAsync(MIME_JPEG)
	}
}
