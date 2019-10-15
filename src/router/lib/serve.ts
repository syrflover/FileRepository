// tslint:disable: no-parameter-reassignment

/**
 *
 * original: https://github.com/koajs/send/blob/master/index.js
 *
 */

/**
 * Module dependencies.
 */

import * as fs from '@syrflover/fs';
import { createReadStream } from 'fs';

// import { normalize, basename, extname, resolve, parse, sep } from 'path';
import { Context } from 'koa';

import File from '../../entity/File';

interface ISendOptions {
    maxage?: number;
    maxAge?: number;
    immutable?: boolean;
    gzip?: boolean;
}

export const serve = async (
    ctx: Context,
    filePath: string,
    {
        content_length: size,
        content_type: type,
        updated_at: last_modified,
    }: File,
    opts: ISendOptions = {},
) => {
    // options
    // const root = opts.root ? normalize(resolve(opts.root)) : '';
    const maxage = opts.maxage || opts.maxAge || 0;
    const immutable = opts.immutable || false;
    // const brotli = opts.brotli !== false;
    const gzip = opts.gzip !== false;

    /* if (setHeaders && typeof setHeaders !== 'function') {
        throw new TypeError('option setHeaders must be function');
    }

    // normalize path
    path = decode(path);

    if (path === -1) return ctx.throw(400, 'failed to decode');

    // index file support
    if (index && trailingSlash) path += index;

    path = resolvePath(root, path); */

    let encodingExt = '';
    // serve brotli file when possible otherwise gzipped file when possible
    /* if (
        ctx.acceptsEncodings('br', 'identity') === 'br' &&
        brotli &&
        (await fs.exists(path + '.br'))
    ) {
        path = path + '.br';
        ctx.set('Content-Encoding', 'br');
        ctx.res.removeHeader('Content-Length');
        encodingExt = '.br';
    } else */

    if (
        ctx.acceptsEncodings('gzip', 'identity') === 'gzip' &&
        gzip &&
        (await fs.exists(`${filePath}.gz`))
    ) {
        filePath = `${filePath}.gz`;
        ctx.set('Content-Encoding', 'gzip');
        ctx.res.removeHeader('Content-Length');
        encodingExt = '.gz';
    }

    /* if (extensions && !/\.[^/]*$/.exec(path)) {
        const list = [].concat(extensions);
        for (let i = 0; i < list.length; i++) {
            let ext = list[i];
            if (typeof ext !== 'string') {
                throw new TypeError(
                    'option extensions must be array of strings or false',
                );
            }
            if (!/^\./.exec(ext)) ext = '.' + ext;
            if (await fs.exists(path + ext)) {
                path = path + ext;
                break;
            }
        }
    } */

    // stat
    /* let stats;
    try {
        stats = await fs.stat(path);

        // Format the path to serve static file servers
        // and not require a trailing slash for directories,
        // so that you can do both `/directory` and `/directory/`
        if (stats.isDirectory()) {
            if (format && index) {
                path += '/' + index;
                stats = await fs.stat(path);
            } else {
                return;
            }
        }
    } catch (err) {
        const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
        if (notfound.includes(err.code)) {
            throw createError(404, err);
        }
        err.status = 500;
        throw err;
    } */

    // stream
    ctx.response.set('Content-Length', `${size}`);
    ctx.response.set('Content-Type', `${type}${encodingExt}`);
    if (!ctx.response.get('Last-Modified')) {
        ctx.set('Last-Modified', last_modified.toUTCString());
    }
    if (!ctx.response.get('Cache-Control')) {
        const directives = [`max-age=${(maxage / 1000).toFixed(0)}`];
        if (immutable) {
            directives.push('immutable');
        }
        ctx.set('Cache-Control', directives.join(','));
    }
    // ctx.type = `${type}${encodingExt}`;
    ctx.body = createReadStream(filePath);

    return filePath;
};
