'use strict';

var app = require('./app.js');
 
//////////////////////
// Greenlock Setup  //
//////////////////////

const greenlock = require('greenlock-express')
    .init({
        packageRoot: __dirname + '/../../',

        // contact for security and critical bug notices
        maintainerEmail: "some.user@gmail.com",

        // where to look for configuration
        configDir: __dirname + '/../../greenlock.d',

        // whether or not to run at cloudscale
        cluster: false,
        communityMember: true
    }) // Serves on 80 and 443
    // Get's SSL certificates magically!
    .serve(app);
