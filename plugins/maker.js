(async () => {
	switch (true) {
		case /^(kannagen|trumptweet)$/i.test(command): {
			await reply(mess.wait)
			conn.sendFile(from, API('https://nekobot.xyz', '/api/imagegen', { type: command, text: (q || ' '), raw: 1 }), '', '', m)
			break
		}
		case /^memeg(en)?/i.test(command): {
			let [t1, t2] = q.split`|`
			if (/image/.test(type) || isQuotedImage) {
				await reply(mess.wait)
				let media = await conn.downloadM(quoted ? quoted[typeQuoted] : m.message[type], quoted ? typeQuoted.replace(/Message/, '') : type.replace(/Message/, ''))
				let url = await functions.uploadImage(media)
				await conn.sendFile(from, API('https://api.memegen.link', `/images/custom/${encodeURIComponent(t1 ? t1 : '_')}/${encodeURIComponent(t2 ? t2 : '_')}.png`, { background: url }), '', '', m)
			} else if (isQuotedSticker) {
				await reply(mess.wait)
				let media = await conn.downloadM(quoted ? quoted[typeQuoted] : m.message[type], quoted ? typeQuoted.replace(/Message/, '') : type.replace(/Message/, ''))
				let url = await uploadFile(media)
				await conn.sendFile(from, API('https://api.memegen.link', `/images/custom/${encodeURIComponent(t1 ? t1 : '_')}/${encodeURIComponent(t2 ? t2 : '_')}.png`, { background: url }), '', '', m)
			} else reply(`Reply image/sticker dgn caption ${prefix + command} <teks>`)
			break
		}
	}
})()