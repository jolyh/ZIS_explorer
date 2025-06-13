let client;

// TODO - Add error handling and actually catch stuff
// TODO - Caching ? save result in files?

export const fetchIntegrations = async () => {
    console.log('Fetching integrations...');
    try {
        const result = await client.request({
            url: `/api/services/zis/registry/integrations`,
            type: 'GET'
        });
        console.log('Response from Integrations fetched:', result);
        return result.integrations; 
    } catch (error) {
        console.error('Error fetching integrations:', error);
        return [];
        //throw error;
    }
}

export const fetchIntegrationBundles = async (integration_name) => {
    console.log('Fetching bundles...');
    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integration_name}/bundles`,
            type: 'GET'
        });
        console.log('Response from Integration bundles fetched:', result);
        return result.bundles; 
    } catch (error) {
        console.error('Error fetching integration bundles:', error);
        return [];
        //throw error;
    }
}

export const fetchIntegrationBundleById = async (integration_name, uuid) => {
    console.log('Fetching bundle content...');
    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integration_name}/bundles/${uuid}`,
            type: 'GET'
        });
        console.log('Response from Integration bundles fetched:', result);
        return result; 
    } catch (error) {
        console.error('Error fetching integration bundles:', error);
        return [];
        //throw error;
    }
}

export const fetchIntegrationJobspecs = async (integration_name) => {
    console.log('Fetching job_specs...');
    try {
        const result = await client.request({
            url: `/api/services/zis/registry/${integration_name}/job_specs`,
            type: 'GET'
        });
        console.log('Response from Integration job_specs fetched:', result);
        return result.job_specs; 
    } catch (error) {
        console.error('Error fetching integration job_specs:', error);
        return [];
        //throw error;
    }
}

// Reconcile bundles with job_specs
// The jobspecs do not link to the bundles directly, so we parse the content of the bundle.
export const reconcileJobspecsToBundles = (bundles, job_specs) => {
    console.log('Reconcile job_specs to bundles...');
    const reconciled = bundles.map(bundle => {
        const matchingJobSpecs = job_specs.filter(job_spec => bundle.content.resources.hasOwnProperty(job_spec.name));
        return {
            ...bundle,
            job_specs: matchingJobSpecs
        };
    });
    console.log('Reconciled bundles with job_specs:', reconciled);
    return reconciled;
}

(async () => {
    client = ZAFClient.init();
    console.log('ZAFClient initialized');
})();