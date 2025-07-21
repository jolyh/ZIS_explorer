export default {
    props: ['integration', 'action', 'jobspec', 'bundle_id'],
    emits: ['on_confirm', 'on_cancel'],
    setup(props, ctx) {

        console.log('Modal setup', props);
        
        const parseJsonFile = async (file) => {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader()
                fileReader.onload = event => resolve(JSON.parse(event.target.result))
                fileReader.onerror = error => reject(error)
                fileReader.readAsText(file)
            })
        }
        
        // UI setup
        let title = 'Loading...';
        let notice = 'This operation cannot be undone.';
        if (props.action === 'install') {
            if (props.jobspec) {
                title = `Install jobspec ${props.jobspec}`;
            } else if (props.bundle_id) {
                title = 'Upload bundle';
                notice = 'Please upload a valid JSON file containing the bundle configuration.';
            }
        } else if (props.action === 'uninstall') {
            if (props.jobspec) {
                title = `Uninstall jobspec ${props.jobspec}`;
            } else if (props.bundle_id) {
                title = `Delete bundle ${props.bundle_id}`;
            }
        } else {
            title = 'Unknown Action';
            notice = 'Invalid action specified.';
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

        const confirm_button_clicked = async () => {
            console.log('Confirm button clicked');

            const confirmButton = document.getElementById('confirm_button');
            confirmButton.disabled = true;
            confirmButton.textContent = 'Processing...';

            let content = null;
            if (currentFile) {
                const bundle = await parseJsonFile(currentFile)
                content = JSON.stringify(bundle, null, 2);
                console.log('Parsed bundle:', content);
            }
            ctx.emit('on_confirm', props.action, props.jobspec, props.bundle_id, content);
        }
        const cancel_button_clicked = () => {
            console.log('Cancel button clicked');
            ctx.emit('on_cancel');
        }

        // TODO handle errors

        return { 
            // Text
            title,
            notice,
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
        <div id="file_upload_container" class="file-input-container" v-if="action === 'install' && bundle_id">
            <div class="custom-file-input">
            <label id="input_label" class="file-input-label">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                Choose JSON File
                <input type="file" id="input" accept=".json" @change="onFileInputchanged($event)"/>
            </label>
            </div>
        </div>
        <div id="notice" class="notice">{{notice}}</div>
        <div class="button-container">
            <button id="cancel_button" class="btn btn-secondary" @click="cancel_button_clicked">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancel
            </button>
            <button id="confirm_button" class="btn btn-primary" @click="confirm_button_clicked" 
                :disabled="!bundle_id && !jobspec && (action != 'install' || action != 'uninstall')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Confirm
            </button>
        </div>
      </div>
    </div>
    `
}