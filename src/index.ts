// Copyright (c) Wictor Wilén. All rights reserved. 
// Licensed under the MIT license.
import * as core from '@actions/core';
import github from '@actions/github';
import { v4 } from 'uuid';
import request from 'request';
import * as ai from 'applicationinsights';

const startUrl = 'http://go.microsoft.com/fwlink/?prd=11901&pver=1.0&sbp=Application%20Insights&plcid=0x409&clcid=0x409&ar=Annotations&sar=Create%20Annotation';


async function run(): Promise<void> {

    ai.setup("9d21cda9-51e5-4257-83ab-c16261b1bf4e");
    try {


        core.debug(`Reading settings`)
        const applicationId = core.getInput('applicationId');
        const apiKey = core.getInput('apiKey');
        const releaseName = core.getInput('releaseName');
        const message = core.getInput('message');
        const actor = core.getInput('actor');

        core.debug(`Locating endpoint`)
        request(startUrl, { followRedirect: false }, (error, response, body) => {
            if (error) {
                console.log('Redirect failed');
                ai.defaultClient.trackException(error);
                core.setFailed(error);
            } else {
                const location = response.headers['location'];

                const releaseProperties = {
                    ReleaseName: releaseName,
                    Message: message,
                    By: actor
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
                        ai.defaultClient.trackException(error);
                        core.setFailed(error);
                    } else {
                        if (response.statusCode === 200) {
                            console.log('Annotation sent')
                            ai.defaultClient.trackEvent({
                                name: "AnnotationSent",
                            });
                            core.setOutput("result", body);
                        } else {
                            ai.defaultClient.trackException({
                                exception:
                                    { name: "Unexpected annotation response", message: response.statusMessage }
                            });
                            core.setFailed(`HTTP status: ${response.statusCode}`);
                        }
                    }
                });
            }
        });
    }
    catch (error) {
        ai.defaultClient.trackException(error);
        console.log(error);
        core.setFailed(error.message);
    }
}

run()