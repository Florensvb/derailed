'use strict';

require('dotenv').config();
const { development } = require('./knexfile');
const bookshelf = require('bookshelf')(require('knex')(development));
const boom = require('boom');
const Hapi = require('hapi');
const plugRoutes = require('./api/routes');

const securePassword = require('bookshelf-secure-password');
bookshelf.plugin(securePassword);
bookshelf.plugin('visibility');
global.bookshelf = bookshelf;

const { User } = require('./models');

const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
        cors: true,
        // files: {
        //     relativeTo: require('path').join(__dirname, '../uploads'),
        // }
    }
});

const init = async () => {

    const validate = async (decoded, request, h) => {
        const user = await new User()
            .where('id', decoded.id)
            .where('username', decoded.username)
            .fetch();
        if (!user) {
            throw boom.unauthorized();
        }

        return {
            isValid: true,
        };
    };

    await server.register(require('hapi-auth-jwt2'));
    await server.register(require('@hapi/inert'));

    const secret = process.env.SECRET;
    const c_user = process.env.C_USER;
    const c_pass = process.env.C_PASS;
    server.auth.strategy('jwt', 'jwt', {
        key: `${{ secret }}`,                       // never share your secret key
        validate,                                   // validate function defined above
        verifyOptions: { algorithms: [ 'HS256' ] }  // pick a strong algorithm
    });
    await server.register(require('@hapi/basic'));
    server.auth.strategy('simple', 'basic', { validate: async (request, user, pass) => {
        return { isValid: c_user === user && c_pass === pass, credentials: { username: c_user } };
    }});
    server.auth.default('jwt');

    server.events.on('response', request => {
        if (!request || !request.response) return;
        console.log(`${request.method.toUpperCase()} ${request.url.pathname} --> ${request.response.statusCode}`);
    });

    plugRoutes(server);

    return server;
};

const start = () => init()
    .then(async () => {
        await server.start(function (err) { console.log(err); });
        console.log(`Server running on ${server.info.uri}`);
    })
    .catch((e) => console.log(e));

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

module.exports =  {
    start,
    init,
};
