let client = null;
let appSettings = null;
let deletedBundleIds = []

// ------------------------
// Mock datas for testing
// ------------------------
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
        const filePath = `./mocks/${dataRequested}.json`;

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
            case 'configurations':
                return data.configs || [];
            case 'connections':
                return data.connections || [];
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

// ------------------------
// Integrations
// ------------------------

// This fetches the list of ZIS integrations.
const fetchIntegrations = async () => {
    console.log('Fetching integrations...');
    if (mockDataEnabled) {
        mockData.integrations = await returnMockData('integrations');
        return mockData.integrations;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/integrations`,
            type: 'GET'
        });
        //console.log('Response from Integrations fetched:', result);
        return result.integrations;
    } catch (error) {
        displayAlertOnError('Error fetching integrations', error);
        return [];
    }
}
export const integrationsApi = {
    fetch: fetchIntegrations
};

// ------------------------
// Bundles
// ------------------------

const fetchBundles = async (integrationName) => {
    console.log('Fetching bundles...');
    if (mockDataEnabled) {
        mockData.bundles = await returnMockData('bundles');
        return mockData.bundles;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integrationName}/bundles`,
            type: 'GET'
        });
        //console.log('Response from Integration bundles fetched:', result);
        return result.bundles;
    } catch (error) {
        displayAlertOnError('Error fetching integration bundles', error);
        return [];
    }
}
const fetchBundle = async (integrationName, bundleId) => {
    console.log('Fetching bundle content...');
    if (mockDataEnabled) {
        mockData.bundle = await returnMockData('bundle');
        return mockData.bundle;
    }

    // If the bundleId is in the deletedBundleIds array, we skip fetching it.
    if (!integrationName || !bundleId || deletedBundleIds.includes(bundleId)) {
        console.warn('Skipping fetchBundle due to missing parameters or bundle already deleted:', { integrationName, bundleId, deletedBundleIds });
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
const uploadBundle = async (integrationName, bundle) => {
    console.log('Uploading bundle content...');
    if (mockDataEnabled) {
        console.warn('Mock data upload for bundle is not implemented.');
        return true;
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
const deleteBundle = async (integrationName, bundleId) => {
    console.log('Deleting bundle content...');
    if (mockDataEnabled) {
        console.warn('Mock data delete for bundle is not implemented.');
        return true;
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
   return await requestToInboundWebhook(
        JSON.stringify({
            bundle: {
                integration: integrationName,
                uuid: bundleId
            }
        }),
        bundleId
    );
}
const inboundWebhookAuth = `Basic ${btoa("your_auth")}`; // Replace with your actual auth token
const requestToInboundWebhook = async (data, bundleId) => {
    console.log('Requesting to inbound webhook for deleting bundle...');
    try {
        const result = await client.request({
            url: `your_inbound_webhook_url`, // Replace with your actual inbound webhook URL
            type: 'POST',
            headers: {
                Authorization: inboundWebhookAuth,
            },
            data: data
        });
        deletedBundleIds.push(bundleId); // Store the bundle ID to delete later
        console.log('Response from inbound webhook:', result);
        return true;
    } catch (error) {
        displayAlertOnError('Error deleting bundle', error);
        return false;
    }
}
export const bundlesApi = {
    fetchBundles: fetchBundles,
    fetchBundle: fetchBundle,
    upload: uploadBundle,
    delete: deleteBundle
}

// ------------------------
// Jobspecs
// ------------------------

const fetchJobspecs = async (integrationName) => {
    console.log('Fetching job_specs...');
    if (mockDataEnabled) {
        mockData.job_specs = await returnMockData('job_specs');
        return mockData.job_specs;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integrationName}/job_specs`,
            type: 'GET'
        });
        return result.job_specs;
    } catch (error) {
        displayAlertOnError('Error fetching integration job_specs', error);
        return [];
    }
}
const installJobspec = async (integrationName, jobspecName) => {
    console.log('Installing jobspecs...');
    if (mockDataEnabled) {
        mockData.job_specs = await returnMockData('job_specs');
        mockData.job_specs[0].installed = true;
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
const uninstallJobspec = async (integrationName, jobspecName) => {
    console.log('Uninstalling job_specs...', integrationName, jobspecName);
    if (mockDataEnabled) {
        mockData.job_specs = await returnMockData('job_specs');
        mockData.job_specs[0].installed = false;
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
const reconcileJobspecsToBundles = (bundles, job_specs) => {
    console.log('Reconcile job_specs to bundles...', { bundles, job_specs });
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

export const jobspecsApi = {
    fetch: fetchJobspecs,
    install: installJobspec,
    uninstall: uninstallJobspec,
    reconcile: reconcileJobspecsToBundles
}

// ------------------------
// Connections
// ------------------------
// TODO - this is not tested yet
const fetchConnections = async (integrationName) => {
    console.log('Fetching connections...');
    if (mockDataEnabled) {
        mockData.integrations = await returnMockData('connections');
        return mockData.integrations;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/integrations/${integrationName}/connections/all`,
            type: 'GET'
        });
        console.log('Response from Connections fetched:', result);
        return result;
    } catch (error) {
        displayAlertOnError('Error fetching integration connections', error);
        return [];
    }
}

export const connectionsApi = {
    fetch: fetchConnections
}

// ------------------------
// Configurations
// ------------------------
const fetchConfigurations = async (integrationName, filter) => {
    console.log('Fetching configurations...');
    if (mockDataEnabled) {
        mockData.integrations = await returnMockData('configurations');
        return mockData.integrations;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/integrations/${integrationName}/configs?filter[scope]=${filter? filter : '*'}`,
            type: 'GET'
        });
        return result.configs;
    } catch (error) {
        displayAlertOnError('Error fetching integration configurations', error);
        return [];
    }
}
const createConfiguration = async (integrationName, config) => {
    console.log('Creating configuration...', { integrationName, config });
    if (mockDataEnabled) {
        console.warn('Mock data upload for config is not implemented.');
        return true;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/integrations/${integrationName}/configs`,
            type: 'POST',
            data: config
        });
        return result.config;
    } catch (error) {
        displayAlertOnError('Error creating integration configuration', error);
        return null;
    }
}
const updateConfiguration = async (integrationName, scope, config) => {
    console.log('Updating configuration...', { integrationName, scope, config });
    if (mockDataEnabled) {
        console.warn('Mock data upload for config is not implemented.');
        return true;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/integrations/${integrationName}/configs/${scope}`,
            type: 'PUT',
            data: config
        });
        return result;
    } catch (error) {
        displayAlertOnError('Error updating integration configuration', error);
        return false;
    }
}
const mergeConfiguration = async (integrationName, scope, config) => {
    console.log('Merging configuration...', { integrationName, scope, config });
    if (mockDataEnabled) {
        console.warn('Mock data upload for config is not implemented.');
        return true;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/integrations/${integrationName}/configs/${scope}`,
            type: 'PATCH',
            data: config
        });
        return result;
    } catch (error) {
        displayAlertOnError('Error merging integration configuration', error);
        return false;
    }
}
const deleteConfiguration = async (integrationName, scope) => {
    console.log('Deleting configuration...', { integrationName, scope });
    if (mockDataEnabled) {
        console.warn('Mock data delete for config is not implemented.');
        return true;
    }

    try {
        const result = await client.request({
            url: `/api/services/zis/integrations/${integrationName}/configs/${scope}`,
            type: 'DELETE'
        });
        return true;
    } catch (error) {
        displayAlertOnError('Error deleting integration configuration', error);
        return false;
    }
}

export const configurationsApi = {
    fetch: fetchConfigurations,
    create: createConfiguration,
    update: updateConfiguration,
    merge: mergeConfiguration,
    delete: deleteConfiguration
}

// ------------------------
// Zendesk Notifications
// ------------------------
const displayAlertOnError = (errorMessage, error) => {
    console.error(errorMessage, error);
    const alertMessage = `An error occurred: ${errorMessage}`;
    client.invoke('notify', alertMessage, 'error');
}
export const displayZendeskNotification = (message, notificationType) => {
    client.invoke('notify', message, notificationType);
}

// ------------------------
// Zendesk App settings and client
// ------------------------
export const getAppSettings = async () => {
    if (appSettings) { return appSettings.settings; }
    appSettings = await client.metadata();
    //console.log("fetchAppSettings called:", appSettings);
    var settings = appSettings.settings || {};
    settings.isDebugMode = mockDataEnabled;
    return settings;
}
export const initClient = async () => {
    if (client) { return client; }
    client = await ZAFClient.init();
    //console.log("ZAFClient initialized");
    return client;
}

(async () => {
    client = await initClient();
})();