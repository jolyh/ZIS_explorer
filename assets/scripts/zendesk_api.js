let client = null;
let modalClient = null;

// TODO - Caching ? save result in files?
// TODO - more error handling than notifications?

/**
 * Fetch all integrations from the Zendesk Integration Service (ZIS) registry.
 * @returns [] - List of integrations
 */
export const fetchIntegrations = async () => {
    console.log('Fetching integrations...');
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
}


// Jobsecs
export const fetchJobspecs = async (integrationName) => {
    console.log('Fetching job_specs...');
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


// Modal handling
/**
 * Open a modal for installing or uninstalling a jobspec or bundle.
 * Requires an integration name and an action ('install' or 'uninstall') as well as either a jobspec name or a bundle UUID.
 * @param {String} integration - name of the integration - Required
 * @param {String} action - possible values: 'install', 'uninstall' - Required
 * @param {String?} jobspec - name of the jobspec to install or uninstall - Optional
 * @param {String?} bundleId - UUID of the bundle to install or uninstall - Optional
 * @returns 
 */
export const openActionModal = (integration, action, jobspec, bundleId, onclose = () => {}) => {

    if (!integration || !action || (!jobspec && !bundleId)) {
        displayAlertOnError("Required parameters are missing for the modal action.");
        console.error("Required parameters are missing for the modal action.", { integration, action, jobspec, bundleId });
        return;
    }

    let url = `assets/iframe_modal.html?integration=${integration}&action=${action}`
    if (jobspec)
        url += `&jobspec=${jobspec}`;
    else if (bundleId)
        url += `&bundleId=${bundleId}`;
        
    client.invoke('instances.create', {
        location: 'modal',
        url: url,
        size: { // optional
            width: '500px',
            height: '300px'
        }
    }).then((modalContext) => {
        // The modal is on screen now
        modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
        // TODO define close modal here and save to the closeModal function?
        modalClient.on('modal.close', () => {
            console.log('Modal closed');
            onclose(); // Call the provided onclose function
            modalClient = null; // Clear the modal client reference
        });
    });

}

export const closeModal = () => {
    // TODO - defo needs better
    client.get('instances')
    .then(function(instancesData) {
        console.log('Instances data:', instancesData);
        var instances = instancesData.instances;
        for (var instanceGuid in instances) {
            if (instances[instanceGuid].location === 'modal') {
                return client.instance(instanceGuid);
            }
        }
    })
    .then(function(modalInstance) {
        modalInstance.invoke('destroy')
        .then(() => {
            console.log('Modal closed successfully');
            modalClient = null; // Clear the modal client reference
        })
    })
    
}

export const getActionFromModalUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        integration: urlParams.get('integration'),
        action: urlParams.get('action'),
        jobspec: urlParams.get('jobspec'),
        bundleId: urlParams.get('bundleId')
    }
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

(async () => {
    client = ZAFClient.init();
    console.log('ZAFClient initialized');
})();