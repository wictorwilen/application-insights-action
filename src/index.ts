// Copyright (c) Wictor Wilén. All rights reserved. 
// Licensed under the MIT license.
import * as core from '@actions/core';
import github from '@actions/github';
import { v4 } from 'uuid';
import request from 'request';


const startUrl = 'http://go.microsoft.com/fwlink/?prd=11901&pver=1.0&sbp=Application%20Insights&plcid=0x409&clcid=0x409&ar=Annotations&sar=Create%20Annotation';


async function run(): Promise<void> {
    try {
        core.debug(`Reading settings`)
        const applicationId = core.getInput('applicationId');
        const apiKey = core.getInput('apiKey');
        const releaseName = core.getInput('releaseName');
        const message = core.getInput('message');

        core.debug(`Locating endpoint`)
        request(startUrl, { followRedirect: false }, (error, response, body) => {
            if (error) {
                console.log('Redirect failed');
                core.setFailed(error);
            } else {
                const location = response.headers['location'];

                const releaseProperties = {
                    ReleaseName: releaseName,
                    Message: message,
                    By: "Github Workflow"
                };

                const body = {
                    Id: v4(),
                    AnnotationName: releaseName,
                    EventTime: (new Date()).toISOString(),
                    Category: 'Deployment',
                    Properties: JSON.stringify(releaseProperties)
                };
                const options = {
                    url: 'https://aigs1.aisvc.visualstudio.com/applications/'
                        + applicationId + '/Annotations?api-version=2015-11',
                    method: 'PUT',
                    headers: {
                        'X-AIAPIKEY': apiKey
                    },
                    body: body,
                    json: true
                };

                core.debug(`Sending annotation`)
                request(options, (error, response, body) => {
                    if (error) {
                        console.log('Annotation failed');
                        core.setFailed(error);
                    } else {
                        if (response.statusCode === 200) {
                            console.log('Annotation sent')
                            core.setOutput("result", body);
                        } else {
                            core.setFailed(`HTTP status: ${response.statusCode}`);
                        }
                    }
                });
            }
        });
    }
    catch (error) {
        console.log(error);
        core.setFailed(error.message);
    }
}

run()