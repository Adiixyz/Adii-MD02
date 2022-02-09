// Kena banned bukan salah gw

const util = require('util')
const QR = require('qrcode')
const simple = require('./lib/simple.js')

exports.jadibot = async (conn, m) => {
	let client = simple.makeWASocket({
		printQRInTerminal: false,
		browser: ['jadibot']
	})
	client.ev.on('connection.update', async (update) => {
		const { connection, qr } = update
		if (qr !== undefined) {
			let res = await QR.toDataURL(qr, { scale: 8 })
			let scan = await conn.sendFile(m.key.remoteJid, res, '', 'Scan bang... jangan lupa join multi-device Beta', m)
			setTimeout(() => {
				conn.sendMessage(m.key.remoteJid, { delete: { remoteJid: m.key.remoteJid, fromMe: true, id: scan.key.id, participant: conn.user.jid }})
			}, 30000)
			if (connection === 'open') {
				conn.reply(m.key.remoteJid, 'Sukses konek\n' + util.format(client.user), m)
			}
		}
	})
	client.ev.on('messages.upsert', require('../handler.js').chatUpdate)
}

// bismillah dibanned mark🗿
