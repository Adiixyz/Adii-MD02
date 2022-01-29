require('./config.js')
'use strict'
const P = require('pino')
const handler = require('./handler.js')
const simple = require('./lib/simple.js')
const { useSingleFileAuthState } = require('@adiwajshing/baileys-md')

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

let authFile = './adii.json'
const { state, saveState } = useSingleFileAuthState(authFile)

async function start() {
	global.conn = simple.makeWASocket({
		logger: P({ level: 'fatal' }),
		browser: ['AdiiMD'],
		printQRInTerminal: true,
		auth: state
	})
	conn.ev.on('connection.update', (update) => {
		console.log('Connection update:', update)
		if (update.connection === 'open') console.log(conn.user)
		else if (update.connection === 'close') start()
	})
	conn.ev.on('creds.update', () => saveState)
	conn.ev.on('messages.upsert', handler.chatUpdate)
	conn.ev.on('group-participants.update', handler.participantsUpdate)
}

start()
