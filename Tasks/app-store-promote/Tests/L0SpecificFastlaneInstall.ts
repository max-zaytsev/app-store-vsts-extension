 /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import os = require('os');

let taskPath = path.join(__dirname, '..', 'app-store-promote.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('authType', 'UserAndPass');
tmr.setInput('username', 'creds-username');
tmr.setInput('password', 'creds-password');
tmr.setInput('appIdentifier', 'com.microsoft.test.appId');
tmr.setInput('chooseBuild', 'latest');
tmr.setInput('shouldAutoRelease', 'true');
tmr.setInput('installFastlane', 'true');
tmr.setInput('fastlaneToolsVersion', 'SpecificVersion');
tmr.setInput('fastlaneToolsSpecificVersion', '2.15.1');

process.env['MOCK_NORMALIZE_SLASHES'] = 'true';
process.env['HOME'] = '/usr/bin';

//construct a string that is JSON, call JSON.parse(string), send that to ma.TaskLibAnswers
let myAnswers: string = `{
    "which": {
        "ruby": "/usr/bin/ruby",
        "gem": "/usr/bin/gem",
        "fastlane": "/usr/bin/fastlane"
    },
    "checkPath" : {
        "/usr/bin/ruby": true,
        "/usr/bin/gem": true,
        "/usr/bin/fastlane": true
    },
    "exec": {
        "/usr/bin/gem uninstall fastlane -a -I": {
            "code": 0,
            "stdout": "Successfully uninstalled fastlane-2.15.1"
        },
        "/usr/bin/gem install fastlane -v 2.15.1": {
            "code": 0,
            "stdout": "1 gem installed"
        },
        "fastlane deliver submit_build -u creds-username -a com.microsoft.test.appId --skip_binary_upload true --skip_metadata true --skip_screenshots true --automatic_release --force": {
            "code": 0,
            "stdout": "consider it delivered!"
        }
    }
 }`;
let json: any = JSON.parse(myAnswers);
// Cast the json blob into a TaskLibAnswers
tmr.setAnswers(<ma.TaskLibAnswers>json);

// This is how you can mock NPM packages...
os.platform = () => {
    return 'darwin';
};
tmr.registerMock('os', os);

tmr.run();