'use strict'
const Baileys = require('@adiwajshing/baileys-md')
const cp = require('child_process')
const axios = require('axios')
const path = require('path')
const util = require('util')
const fs = require('fs')

const acrcloud = require('acrcloud')
const acr = new acrcloud({
	host: 'identify-eu-west-1.acrcloud.com',
	access_key: 'f692756eebf6326010ab8694246d80e7',
	access_secret: 'm2KQYmHdBCthmD7sOTtBExB9089TL7hiAazcUEmb'
})

const pkg = require('./package.json')
const simple = require('./lib/simple.js')
const functions = require('./lib/function.js')
const { menu, mess, tos } = require('./lib/txt.js')
const { color, clockString, isUrl, getBuffer, pickRandom, parseResult, uploadFile } = functions

const time = new Date().toLocaleString('es-AR')
const delay = ms => Baileys.delay(ms)

let tebakgambar = {}
let susunkata = {}
let tebakkata = {}

module.exports = {
	async chatUpdate(msg) {
		const m = msg.messages[0]
		// console.log(m)
		if (!msg || !m.message) return
		if (Baileys.isJidBroadcast(m.key.remoteJid) || m.key.id.startsWith('BAE5') && m.key.id.length === 16 || m.key.id.startsWith('3EB0') && m.key.id.length === 12) return
		const from = m.chat = m.key.remoteJid
		const type = Object.keys(m.message)[0]
		const mentionedJid = m.mentionedJid = m.message[type].contextInfo ? m.message[type].contextInfo.mentionedJid : []
		const quoted = m.quoted = m.message[type].contextInfo ? m.message[type].contextInfo.quotedMessage : null
		const typeQuoted = quoted && Object.keys(quoted)[0]
		// const body = m.message.conversation || m.message[type].caption || m.message[type].text || (type == 'listResponseMessage' && m.message[type].singleSelectReply.selectedRowId) || (type == 'buttonsResponseMessage' && m.message[type].selectedButtonId) || (type == 'templateButtonReplyMessage' && m.message[type].selectedId) || ''
		const body = m.message.conversation || (m.message.imageMessage && m.message.imageMessage.caption) || (m.message.videoMessage && m.message.videoMessage.caption) || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || (m.message.listResponseMessage && m.message.listResponseMessage.singleSelectReply.selectedRowId) || (m.message.buttonsResponseMessage && m.message.buttonsResponseMessage.selectedButtonId) || (m.message.templateButtonReplyMessage && m.message.templateButtonReplyMessage.selectedId) || ''
		const budy = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text)
		const command = body.startsWith(prefix) ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : ''
		const args = body.trim().split(/ +/).slice(1)
		const q = args.join` `
			
		const isGroup = Baileys.isJidGroup(from)
		const sender = m.key.fromMe ? conn.user.jid : isGroup ? m.key.participant : from
		const groupMetadata = isGroup ? await conn.groupMetadata(from) : {}
		const groupAdmins = isGroup ? await conn.getGroupAdmins(from) : []
		const groupName = isGroup ? groupMetadata.subject : ''
		const isAdmin = isGroup && groupAdmins.includes(sender)
		const isBotAdmin = isGroup && groupAdmins.includes(conn.user.jid)
		const pushname = m.key.fromMe ? (conn.user.name || conn.user.verifiedName) : m.pushName
		const isOwner = m.key.fromMe || ownerNumber.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net').includes(sender)
			
		const isQuotedImage = quoted ? (/document|image/.test(typeQuoted) && /image/.test(quoted[typeQuoted].mimetype)) : false
		const isQuotedAudio = quoted ? (/document|audio/.test(typeQuoted) && /audio/.test(quoted[typeQuoted].mimetype)) : false
		const isQuotedVideo = quoted ? (/document|video/.test(typeQuoted) && /video/.test(quoted[typeQuoted].mimetype)) : false
		const isQuotedSticker = quoted ? /sticker/.test(typeQuoted) : false
			
		const reply = async (text, opt) => {
			await conn.sendPresenceUpdate('composing', from)
			conn.sendMessage(from, { text, ...opt }, { quoted: m, ephemeralExpiration: 24*60*60 })
		}
			
		if (mode == 'self' && !isOwner) return
		if (m.message) console.log(`[${color(time, 'green')}] ${color(body || util.format(m.message), 'cyan')} dari ${color(pushname, 'blue')} di ${color(isGroup ? groupName : 'Private chat', 'purple')} (${from})`)
		/*
		if (isGroup && m.message.viewOnceMessage && !m.key.fromMe) {
			let tipe = m.message.viewOnceMessage.message.videoMessage ? m.message.viewOnceMessage.message.videoMessage : m.message.viewOnceMessage.message.imageMessage
			tipe.viewOnce = false
			let mek = m.message.viewOnceMessage.message.imageMessage ? { key: { fromMe: false, participant: sender, id: m.key.id }, message: { viewOnceMessage: { message: { imageMessage: { viewOnce: true }}}}} :  { key: { fromMe: false, participant: sender, id: m.key.id }, message: { viewOnceMessage: { message: { videoMessage: { viewOnce: true }}}}}
			let once = Baileys.generateWAMessageFromContent(from, m.message.viewOnceMessage.message, { quoted: mek })
			await reply('viewOnce detected!').then(() => conn.relayMessage(from, once.message, { messageId: once.key.id }))
		}
		
		conn.sendReadReceipt(from, sender, [m.key.id])
		*/
		if (tebakkata[from] && quoted && m.message[type].contextInfo.stanzaId == tebakkata[from][0].key.id && budy) {
			if (budy.toLowerCase() !== tebakkata[from][1].jawaban.toLowerCase()) return reply('Salah!')
			reply('Yeay, Jawaban Kamu Benar!')
			clearTimeout(tebakkata[from].timeout)
			delete tebakkata[from]
		} else if (susunkata[from] && quoted && m.message[type].contextInfo.stanzaId == susunkata[from][0].key.id && budy) {
			if (budy.toLowerCase() !== susunkata[from][1].jawaban.toLowerCase()) return reply('Salah!')
			reply('Yeay, Jawaban Kamu Benar!')
			clearTimeout(susunkata[from].timeout)
			delete susunkata[from]
		} else if (tebakgambar[from] && quoted && m.message[type].contextInfo.stanzaId == tebakgambar[from][0].key.id && budy) {
			if (budy.toLowerCase() !== tebakgambar[from][1].jawaban.toLowerCase()) return reply('Salah!')
			reply('Yeay, Jawaban Kamu Benar!')
			clearTimeout(tebakgambar[from].timeout)
			delete tebakgambar[from]
		}
		
		fs.readdirSync('./plugins').forEach((file) => {
			if (path.extname(file).toLowerCase() == '.js') {
				eval(fs.readFileSync('./plugins/' + file,  'utf8'))
			}
		})
		/*
		switch (command) {
			case 'tes': {
				require('./lib/jadibot.js').jadibot(conn, m)
				break
			}
			default:
			break
		}
		*/
	},
	async participantsUpdate(event) {
		console.log(event)
	}
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(`[UPDATE] '${__filename}'`)
	delete require.cache[file]
	require(file)
})
