// 极简静态服务器：用于本地运行 Inspector 测试页
// 用法：node server.js [端口]，默认 8000；然后浏览器打开 http://localhost:8000/test/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath( new URL( '.', import.meta.url ) );
const PORT = Number( process.argv[ 2 ] ) || 8000;

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
};

createServer( async ( req, res ) => {

	try {

		const urlPath = decodeURIComponent( new URL( req.url, 'http://localhost' ).pathname );
		const filePath = normalize( join( ROOT, urlPath ) );

		// 防止路径遍历
		const rel = relative( ROOT, filePath );
		if ( rel.startsWith( '..' ) || isAbsolute( rel ) ) {

			res.writeHead( 403 ).end( 'Forbidden' );
			return;

		}

		// 目录默认返回 index.html
		let target = filePath;
		try {

			const s = await stat( target );
			if ( s.isDirectory() ) target = join( target, 'index.html' );

		} catch {

			// 交给下方 readFile 报 404

		}

		const data = await readFile( target );
		res.writeHead( 200, { 'Content-Type': MIME[ extname( target ) ] || 'application/octet-stream' } );
		res.end( data );

	} catch {

		res.writeHead( 404, { 'Content-Type': 'text/plain; charset=utf-8' } );
		res.end( '404 Not Found: ' + req.url );

	}

} ).listen( PORT, () => {

	console.log( `Inspector 测试服务器已启动: http://localhost:${ PORT }/test/` );
	console.log( '（若浏览器提示 WebGPU 不可用，请使用最新版 Chrome/Edge 并开启硬件加速）' );

} );
