# ZIS Explorer

This app allows you to easily visualise the ZIS bundles and installed jobspecs associated with your Zendesk account's integration(s).
You can preview bundle content and upload new ones as well as see job specs statuses and manage them.

### The following information is displayed:

* List of your account's integration.
* For the selected integration, list of all the bundles associated.
* List of all the job spec associated with a bundle.
* Preview of the bundle.
* Preview can content can be copied and preview can be expanded to take more screenspace.

Please submit bug reports to [Insert Link](). Pull requests are welcome.

### Screenshot(s):

![Screenshot of the app without the preview open](/assets/screenshots/app_visual_no_preview.png "App without preview")

![Screenshot of the app with the preview open](/assets/screenshots/app_visual_with_preview.png "App with bundle preview open")

### Dependencies

This apps is using [Vue.js](https://vuejs.org/guide/introduction.html) imported using unpkg following [Vue.js quickstart guide](https://vuejs.org/guide/quick-start.html#using-the-global-build).

### Testing 
* Configure `zcli` on your desktop. 
* Run the app via terminal using `zcli apps:server`.
* Open your Zendesk account and add `?zcli_apps=true` to the url.
* Enjoy.

### Useful APIs
* [ZAF documentation](https://developer.zendesk.com/documentation/apps/app-developer-guide/using-the-apps-framework/)
* [Using zcli](https://developer.zendesk.com/documentation/apps/getting-started/using-zcli/)
* [ZAF APIs](https://developer.zendesk.com/api-reference/apps/apps-core-api/client_api/)

* [ZIS Documentation](https://developer.zendesk.com/documentation/integration-services/)
* [ZIS APIs](https://developer.zendesk.com/api-reference/integration-services/registry/introduction/)
* [ZIS integrations APIs](https://developer.zendesk.com/api-reference/integration-services/registry/integrations/)
* [Bundles APIs](https://developer.zendesk.com/api-reference/integration-services/registry/bundles/)
* [Job specs APIs](https://developer.zendesk.com/api-reference/integration-services/registry/jobspecs/)
