let client = null;
let appSettings = null;

let deleteBundleIds = []

// TODO - Caching ? save result in files?
// TODO - more error handling than notifications?

const mockDataEnabled = false; // Set to true to enable mock data
const mockLoadingEnabled = false; // Set to true to fake loading time for mock data
const mockData = {
    integrations: [],
    bundles: [],
    bundle: {},
    job_specs: []
};
/**
 * Returns mock data from a JSON file based on the requested type.
 * The JSON files are located in the examples directory under the path "./assets/examples/file.json".
 * @param {String} dataRequested - The type of data requested, e.g., 'integrations', 'bundles', 'bundle', 'job_specs'.
 * @returns 
 */
const returnMockData = async (dataRequested) => {
    if (mockLoadingEnabled)
        await randomMockedWait(); // Simulate network delay for mock data - mostly for UI testing
    try {
        // Define the file path
        const filePath = `./examples/${dataRequested}.json`;

        // Use fetch API to get the file
        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`Failed to load mock data from ${filePath}: ${response.status} ${response.statusText}`);
        }

        // Parse the JSON data
        const data = await response.json();

        // Return the appropriate property based on the requested data type
        switch (dataRequested) {
            case 'integrations':
                return data.integrations || [];
            case 'bundles':
                return data.bundles || [];
            case 'bundle':
                return data || [];
            case 'job_specs':
                return data.job_specs || [];
            default:
                return data;
        }
    } catch (error) {
        console.error(`Error loading mock data for ${dataRequested}:`, error);
        displayAlertOnError(`Error loading mock data for ${dataRequested}`, error);
        return [];
    }
}
const wait = (milliseconds) => new Promise((resolve, _) => {
    setTimeout(resolve, milliseconds);
});
/** 
 * Simulates a random wait time between 1 and 3 seconds.
 * This is used to simulate network delay for mock data.
 */
const randomMockedWait = async () => { 
    return await wait((Math.floor(Math.random() * 3) + 1) * 1000);
}

/**
 * Fetch all integrations from the Zendesk Integration Service (ZIS) registry.
 * @returns [] - List of integrations
 */
export const fetchIntegrations = async () => {
    console.log('Fetching integrations...');
    if (mockDataEnabled) {
        mockData.integrations = await returnMockData('integrations'); // Load mock data for integrations
        return mockData.integrations; // Return mock data if enabled
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/integrations`,
            type: 'GET'
        });
        //console.log('Response from Integrations fetched:', result);
        return result.integrations;
    } catch (error) {
        displayAlertOnError('Error fetching integration job_specs', error);
        return [];
    }
}

// Bundles
export const fetchBundles = async (integrationName) => {
    console.log('Fetching bundles...');
    if (mockDataEnabled) {
        mockData.bundles = await returnMockData('bundles'); // Load mock data for integrations
        return mockData.bundles; // Return mock data if enabled
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integrationName}/bundles`,
            type: 'GET'
        });
        //console.log('Response from Integration bundles fetched:', result);
        return result.bundles;
    } catch (error) {
        displayAlertOnError('Error fetching integration job_specs', error);
        return [];
    }
}
export const fetchBundle = async (integrationName, bundleId) => {
    console.log('Fetching bundle content...');
    if (mockDataEnabled) {
        mockData.bundle = await returnMockData('bundle'); // Load mock data for integrations
        return mockData.bundle; // Return mock data if enabled
    }

    // If the bundleId is in the deleteBundleIds array, we skip fetching it.
    if (!integrationName || !bundleId || deleteBundleIds.includes(bundleId)) {
        console.warn('Skipping fetchBundle due to missing parameters or bundle already deleted:', { integrationName, bundleId, deleteBundleIds });
        return {};
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integrationName}/bundles/${bundleId}`,
            type: 'GET'
        });
        //console.log('Response from Integration bundles fetched:', result);
        return result;
    } catch (error) {
        displayAlertOnError('Error fetching bundle', error);
        return [];
    }
}
export const uploadBundle = async (integrationName, bundle) => {
    console.log('Uploading bundle content...');
    if (mockDataEnabled) {
        console.warn('Mock data upload for bundle is not implemented.');
        return true; // Simulate success for mock data
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integrationName}/bundles`,
            type: 'POST',
            contentType: 'application/json',
            data: bundle
        });
        return true;
    } catch (error) {
        displayAlertOnError('Error uploading bundle', error);
        return false;
    }
}
export const deleteBundle = async (integrationName, bundleId) => {
    console.log('Deleting bundle content...');
    if (mockDataEnabled) {
        console.warn('Mock data delete for bundle is not implemented.');
        return true; // Simulate success for mock data
    }

    // The API for deleting bundles is not available in the ZIS API, so we use the inbound webhook to delete the bundle.
    // This will be added soon.
    /*
    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integrationName}/bundles/${bundleId}`,
            type: 'DELETE'
        });
        return true;
    } catch (error) {
        displayAlertOnError('Error deleting bundle', error);
        return false;
    }
    */
   return await requestToInboundWebhook(JSON.stringify({
        bundle: {
            integration: integrationName,
            uuid: bundleId
        }
    }))

}

const inboundWebhookAuth = `Basic ${btoa("username:password")}`; // Replace with actual credentials or use a secure method to store them")}`
const requestToInboundWebhook = async (data) => {
    console.log('Requesting to inbound webhook for deleting bundle...');
    try {
        const result = await client.request({
            url: `/api/services/zis/inbound_webhooks/generic/ingest/id`,
            type: 'POST',
            headers: {
                Authorization: inboundWebhookAuth,
            },
            data: data
        });
        deleteBundleIds.push(data.bundle.uuid); // Store the bundle ID to delete later
        console.log('Response from inbound webhook:', result);
        return true;
    } catch (error) {
        displayAlertOnError('Error deleting bundle', error);
        return false;
    }
}


// Jobsecs
export const fetchJobspecs = async (integrationName) => {
    console.log('Fetching job_specs...');
    if (mockDataEnabled) {
        mockData.job_specs = await returnMockData('job_specs'); // Load mock data for integrations
        return mockData.job_specs; // Return mock data if enabled
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integrationName}/job_specs`,
            type: 'GET'
        });
        //console.log('Response from Integration job_specs fetched:', result);
        return result.job_specs;
    } catch (error) {
        displayAlertOnError('Error fetching integration job_specs', error);
        return [];
    }
}
export const installJobspec = async (integrationName, jobspecName) => {
    console.log('Installing jobspecs...');
    if (mockDataEnabled) {
        mockData.job_specs = await returnMockData('job_specs'); // Load mock data for integrations
        mockData.job_specs[0].installed = true; // Simulate successful installation
        return true;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/job_specs/install?job_spec_name=zis:${integrationName}:job_spec:${jobspecName}`,
            type: 'POST'
        });
        return true;
    } catch (error) {
        displayAlertOnError('Error installing the jobspecs', error);
        return false;
    }
}
export const uninstallJobspec = async (integrationName, jobspecName) => {
    console.log('Uninstalling job_specs...', integrationName, jobspecName);
    if (mockDataEnabled) {
        mockData.job_specs = await returnMockData('job_specs'); // Load mock data for integrations
        mockData.job_specs[0].installed = false; // Simulate successful uninstallation
        return true;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/job_specs/install?job_spec_name=zis:${integrationName}:job_spec:${jobspecName}`,
            type: 'DELETE'
        });
        return true;
    } catch (error) {
        displayAlertOnError('Error uninstalling the jobspecs', error);
        return false;
    }
}

// Reconcile bundles with job_specs
// The jobspecs do not link to the bundles directly, so we parse the content of the bundle.
export const reconcileJobspecsToBundles = (bundles, job_specs) => {
    console.log('Reconcile job_specs to bundles...');
    console.log('bundles:', bundles);
    console.log('job_specs:', job_specs);
    const reconciled = bundles.map(bundle => {
        const matchingJobSpecs = job_specs.filter(job_spec => bundle.content.resources.hasOwnProperty(job_spec.name));
        return {
            ...bundle,
            job_specs: matchingJobSpecs
        };
    });
    //console.log('Reconciled bundles with job_specs:', reconciled);
    return reconciled;
}

// Zendesk Notifications
const displayAlertOnError = (errorMessage, error) => {
    console.error(errorMessage, error);
    const alertMessage = `An error occurred: ${errorMessage}`;
    client.invoke('notify', alertMessage, 'error');
}
export const displayZendeskNotification = (message, notificationType) => {
    client.invoke('notify', message, notificationType);
}

// Zendesk App Settings
export const getAppSettings = async () => {
    if (appSettings) {
        console.log("Using cached app settings");
        return appSettings.settings;
    }
    appSettings = await client.metadata();
    console.log("fetchAppSettings called");
    console.log(appSettings);
    var settings = appSettings.settings || {}; // should send null instead?
    settings.isDebugMode = mockDataEnabled;
    return settings;
}

export const initClient = async () => {
    if (client) {
        console.warn("ZAFClient is already initialized.");
        return client;
    }
    client = ZAFClient.init();
    console.log("ZAFClient initialized");
    return client;
}

(async () => {
    client = await initClient()
})();