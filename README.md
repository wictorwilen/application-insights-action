# Application Insights Deploy Annotation Action

A Github Action that creates Deployment annoations in Application Insights

![.github/workflows/test.yml](https://github.com/wictorwilen/application-insights-action/workflows/.github/workflows/test.yml/badge.svg)

## Inputs

The action accepts the following inputs:

* **applicationId** - The Application Id of Application Insights
* **apiKey** - An Application Insights API Key with *Write Annotations* permissions
* **releaseName** - The release name to use in the annotation
* **message** - An optional message
* **actor** - Text to use as created by in the annotation

## Sample configuration

``` yaml
- name: Annotation
  uses: wictorwilen/application-insights-action@v1
  id: annotation
  with:
    applicationId: ${{ secrets.APPLICATION_ID }}
    apiKey: ${{secrets.API_KEY}}
    releaseName: ${{ github.event_name }}
    message: ${{ github.event.head_commit.message }}
    actor: ${{ github.actor }}

```
