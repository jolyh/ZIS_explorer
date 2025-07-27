export default {
    props: ['action', 'target', 'target_id'],
    emits: ['on_confirm', 'on_cancel'],
    setup(props, ctx) {

        /*
        * Action modal is used to confirm actions like upload, delete, merge, edit, create, install, uninstall
        * 'upload' -> upload a bundle
        * 'delete' -> delete a bundle, configuration
        * 'merge' -> merge changes into a configuration (takes new configuration and merges it with the existing one) - done by uploading a new file
        * 'edit' -> edit a configuration (replaces the existing configuration with the new one) - done by uploading a new file
        * 'create' -> create a new configuration - done by uploading a new file
        * 'install' -> install a jobspec
        * 'uninstall' -> uninstall a jobspec
        */

        console.log('Modal setup', props);
        
        const parseJsonFile = async (file) => {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader()
                fileReader.onload = event => resolve(JSON.parse(event.target.result))
                fileReader.onerror = error => reject(error)
                fileReader.readAsText(file)
            })
        }

        // UI events
        let currentFile = null;
        const onFileInputchanged = (e) => {
            console.log('File input changed', e);
            const fileName = e.target.files.length > 0 ? e.target.files[0].name : 'No file selected';
            currentFile = e.target.files.length > 0 ? e.target.files[0] : null;
            const fileNameDisplay = document.getElementById('input_label');
            fileNameDisplay.textContent = fileName;
        }

        // TODO do some check to disable the confirm button if no file is selected

        const confirm_button_clicked = async () => {

            const confirmButton = document.getElementById('confirm_button');
            confirmButton.disabled = true;
            confirmButton.textContent = 'Processing...';

            let content = null;
            if (currentFile) {
                const bundle = await parseJsonFile(currentFile)
                content = JSON.stringify(bundle, null, 2);
                console.log('Parsed bundle:', content);
            }
            try {
                ctx.emit('on_confirm', props.action, props.target, props.target_id, content);
            } catch (error) {
                console.error('Error emitting on_confirm:', error);
            }
        }
        const cancel_button_clicked = () => {
            console.log('Cancel button clicked');
            ctx.emit('on_cancel');
        }

        // UI setup
        let title = `${props.action.charAt(0).toUpperCase() + props.action.slice(1)} ${props.target} ${props.target_id ? props.target_id : ''}`;
        let notice = 'This operation cannot be undone.';
        switch (props.action) {
            case 'upload':
                notice = 'Please upload a valid JSON file containing the bundle configuration.';
                break;
            case 'delete':
                notice = `Are you sure you want to delete the ${props.target} ${props.target_id}? This action cannot be undone.`;
                break;
            case 'merge':
                notice = `Are you sure you want to update the changes into the ${props.target} ${props.target_id}? This will overwrite existing properties of the ${props.target}.`;
                break;
            case 'edit':
                notice = `Are you sure you want to replace the ${props.target} ${props.target_id}? This will overwrite the entirety of the ${props.target}.`;
                break;
            case 'create':
                notice = `Are you sure you want to create a new ${props.target}?`;
                break;
            case 'install':
                notice = `Are you sure you want to install the ${props.target} ${props.target_id}? This will enable it in the system.`;
                break;
            case 'uninstall':
                notice = `Are you sure you want to uninstall the ${props.target} ${props.target_id}? This will disable it from the system.`;
                break;
            default:
                title = `Action Confirmation`;
                notice = `Are you sure you want to proceed with this action?`;
                break; 
        }

        const shouldUploadFile = 
            props.action === 'upload'
            || props.action === 'create'
            || props.action === 'merge' 
            || props.action === 'edit';

        return { 
            // UI
            title,
            notice,
            shouldUploadFile,
            // File handling
            onFileInputchanged,
            // Buttons
            confirm_button_clicked,
            cancel_button_clicked
        };
    },
    template: `
    <div :class="{ active: true }" @click="cancel_button_clicked">
    <!-- Modal content -->
      <div class="modal-content" @click.stop>
        <h1 id="title">{{title}}</h1>
        <div id="file_upload_container" class="file-input-container" v-if="shouldUploadFile">
            <div class="custom-file-input">
            <label id="input_label" class="file-input-label">
                <svg>
                    <use xlink:href="./icons/file.svg#file_icon"></use>
                </svg>
                Choose JSON File
                <input type="file" id="input" accept=".json" @change="onFileInputchanged($event)"/>
            </label>
            </div>
        </div>
        <div v-if="notice" id="notice" class="notice">{{notice}}</div>
        <div class="button-container">
            <button id="cancel_button" class="btn btn-secondary" @click="cancel_button_clicked">
                <svg>
                    <use xlink:href="./icons/cancel.svg#cancel_icon"></use>
                </svg>
                Cancel
            </button>
            <button id="confirm_button" class="btn btn-primary" @click="confirm_button_clicked">
                <svg>
                    <use xlink:href="./icons/confirm.svg#confirm_icon"></use>
                </svg>
                Confirm
            </button>
        </div>
      </div>
    </div>
    `
}