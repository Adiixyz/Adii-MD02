(async () => {
	switch (true) {
		case /^yts(earch)?$/i.test(command): {
			if (!q) return reply(`Example:${prefix + command} phonk music`)
			await reply(mess.wait)
			axios.get(API('hardianto', '/yt/search', { query: q }, 'apikey')).then(async ({ data }) => {
				let res = data.result.filter(v => v.type == 'video')
				let capt = res.map(v => `*${v.title}*\nUrl: ${v.url}\nDuration: ${v.timestamp}\nUploaded ${v.ago}\n${v.views} Views`).join('\n' + '='.repeat(25) + '\n')
				reply(capt.trim(), { contextInfo: { externalAdReply: { title: res[0].title, body: res[0].description, mediaType: 2, thumbnail: (await conn.getFile(res[0].image)).data, mediaUrl: res[0].url }}})
			}).catch(reply)
			break
		}
		case /^google$/i.test(command): {
			if (!q) return reply(`Example:${prefix + command} apa itu bot`)
			await reply(mess.wait)
			axios.get(API('zacros', '/search/google', { query: q })).then(async ({ data }) => {
				let teks = data.result.map(v => `*${v.title}*\n_${v.link}_\n_${v.snippet}_`).join('\n\n')
				// conn.sendFile(from, API('popcat', '/screenshot', { url: `https://google.com/search?q=${encodeURIComponent(q)}` }), '', teks, m)
				reply(teks)
			}).catch(reply)
			break
		}
		case /^whatmusi(c|k)$/i.test(command): {
			if (/video/.test(type) || isQuotedVideo || isQuotedAudio) {
				await reply(mess.wait)
				let media = await conn.downloadM(quoted ? quoted[typeQuoted] : m.message[type], quoted ? typeQuoted.replace(/Message/, '') : type.replace(/Message/, ''))
				acr.identify(media).then(res => {
					if (res.status.code !== 0) return reply(res.status.msg)
					let { title, artists, album, genres, release_date } = res.metadata.music[0]
					let teks = `*• Title:* ${title}\n${artists !== undefined ? '*• Artist:* ' + artists.map(v => v.name).join(', ') : ''}\n${album.name !== undefined ? '*• Album:* ' + album.name : ''}\n${genres !== undefined ? '*• Genres:* ' + genres.map(v => v.name).join(', ') : ''}\n*• Release Date:* ${release_date}`
					reply('*RESULT FOUND*\n\n' + teks.trim())
				}).catch(reply)
			}
			break
		}
	}
})()