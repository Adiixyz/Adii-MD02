const fs = require('fs')

global.prefix = '.'
global.mode = 'publik' //kalo mau self ubah dari publik ke self
global.packName = 'Adii-MD'
global.authorName = 'Beta'
// global.thumb = fs.readFileSync('./thumb.jpeg')
global.ownerNumber = ['+60 19-978 2326']
global.thumbnailUrl = ['https://telegra.ph/file/69d52042b39386c222151.jpg', 'https://telegra.ph/file/7079e0b324406d3d7543c.jpg', 'https://telegra.ph/file/3a3edf8916e3239522a34.jpg']
// global.db = JSON.parse(fs.readFileSync('./db.json'))

global.APIs = {
	zeks: 'https://api.zeks.me/api',
	popcat: 'https://api.popcat.xyz',
	hardianto: 'https://hardianto.xyz/api',
	zacros: 'https://api.zacros.my.id',
	nrtm: 'https://nurutomo.herokuapp.com',
	hadi: 'http://hadi-api.herokuapp.com/api',
	megayaa: 'https://megayaa.herokuapp.com/api',
	mely: 'https://melcanz.com'
}
global.APIKeys = {
	'https://api.zeks.me/api': 'Nyarlathotep',
	'https://hardianto.xyz/api': 'hardianto'
	'https://melcanz.com: 'GVQjlc7H'
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(`[UPDATE] '${__filename}'`)
	delete require.cache[file]
	require(file)
})
