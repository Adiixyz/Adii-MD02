(async () => {
	switch (true) {
		case /^(menu|help)$/i.test(command): {
			let { data } = await conn.getFile(pickRandom(thumbnailUrl))
			// if (isGroup) {
				// let buttons = [{ buttonId: prefix + 'tos', buttonText: { displayText: 'TOS', type: 1 }}, { buttonId: prefix + 'owner', buttonText: { displayText: 'Owner', type: 1 }}, { buttonId: prefix + 'sc', buttonText: { displayText: 'Source Code', type: 1 }}]
				// await conn.sendMessage(from, { location: { jpegThumbnail: data }, caption: menu(prefix, clockString), footer: `Hai @${sender.split('@')[0]} ${decodeURI('%F0%9F%91%8B')}`, mentions: [sender], buttons })
			// } else {
				let templateButtons = [{ urlButton: { displayText: 'Source Code', url : pkg.homepage }}, { quickReplyButton: { displayText: 'Ping', id: prefix + 'ping' }}, { quickReplyButton: { displayText: 'Owner', id: prefix + 'owner' }}, { quickReplyButton: { displayText: 'TOS', id: prefix + 'tos' }}]
				await conn.sendMessage(from, { location: { jpegThumbnail: data }, caption: menu(prefix, clockString), footer: `Hai ${pushname} ${decodeURI('%F0%9F%91%8B')}`, templateButtons })
			// }
			break
		}
		case /^(tos|rules|rule)$/i.test(command): {
			reply(tos(prefix))
			break
		}
		case /^sc$/i.test(command): {
			reply(pkg.homepage)
			break
		}
		case /^r(vo|eadviewonce)$/i.test(command): {
			if (/viewOnce/.test(typeQuoted)) {
				let tipe = quoted[typeQuoted].message.imageMessage ? quoted[typeQuoted].message.imageMessage : quoted[typeQuoted].message.videoMessage
				conn.downloadM(tipe, quoted[typeQuoted].message.imageMessage ? 'image' : 'video').then(v => conn.sendFile(from, v, '', quoted[typeQuoted].message.imageMessage ? quoted[typeQuoted].message.imageMessage.caption : quoted[typeQuoted].message.videoMessage.caption, m))
			} else reply('Reply viewOnceMessage!')
			break
		}
		case /^ss(web)?f?$/i.test(command): {
			if (!args[0]) return reply('Urlnya?')
			let url = /https?:\/\//.test(args[0]) ? args[0] : 'https://' + args[0]
			let full = /f$/i.test(command) ? API('hadi', '/ssweb2', { url }) : API('popcat', '/screenshot', { url })
			await reply(mess.wait)
			conn.sendFile(from, full, '', url, m)
			break
		}
		case /^(get|fetch)$/i.test(command): {
			if (!q) return reply('Urlnya?')
			let { href } = new URL(q)
			axios.get(href).then(res => {
				if (!/text|json/.test(res.headers['content-type'])) return conn.sendFile(from, href, '', href, m)
				else reply(res.data)
			}).catch(reply)
			break
		}
		case /^owner$/i.test(command): {
			let owner = ownerNumber[1].replace(/\D/g, '')
			let contacts = Baileys.generateWAMessageFromContent(from, Baileys.proto.Message.fromObject({ contactsArrayMessage: { displayName: 'Owner', contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Adii\nTEL;waid=${owner}:${owner}\nEND:VCARD` }] }}), { userJid: conn.user.jid, quoted: m })
			await conn.relayMessage(from, contacts.message, { messageId: contacts.key.id })
			// conn.sendContact(from, ownerNumber[1], 'Ripp', m)
			break
		}
		case /^cekprefix$/i.test(body): {
			reply('Prefix: ' + prefix)
			break
		}
		case /^del(ete)?$/i.test(command): {
			if (quoted && m.message[type].contextInfo.participant == conn.user.jid) conn.sendMessage(from, { delete: { remoteJid: from, fromMe: true, id: m.message[type].contextInfo.stanzaId, participant: m.message[type].contextInfo.participant }})
			break
		}
		case /^(up|run)time$/i.test(command): {
			reply(clockString(process.uptime()))
			break
		}
		case /^(ping|speed)$/i.test(command): {
			let old = +new Date
			await reply('_Testing speed..._')
			let neww = +new Date
			let speed = functions.parseMs(neww - old)
                        let spoon = `${speed.seconds}.${speed.milliseconds}`
			reply(`Merespon dalam ${spoon} detik`)
			break
		}
		case /^(list(grup|group|gc)|grouplist)$/i.test(command): {
			let grup = Object.values(await conn.groupFetchAllParticipating()).map(v => `${v.subject}\n${v.id}`).join`\n\n`
			reply('List Groups:\n\n' + grup)
			break
		}
	}
})()
