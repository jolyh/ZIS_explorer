export default {
  props: ['job_specs', 'allow_jobspec_update', 'is_loading'],
  emits: ['install_jobspec', 'uninstall_jobspec'],
  setup(props, ctx) {

    const install_button_clicked = (job_name) => {
      console.log('Install button clicked for job:', job_name);
      ctx.emit('install_jobspec', job_name);
    }
    const uninstall_button_clicked = (job_name) => {
      console.log('Uninstall button clicked for job:', job_name);
      ctx.emit('uninstall_jobspec', job_name);
    }
    return { install_button_clicked, uninstall_button_clicked }
  },
  template: 
  `
    <tr class="expanded-row-content">
      <td colspan="5">
        <div class="jobspec-container">
          <div class="jobspec-title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"                          
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Job Specifications
          </div>
            <table class="integration_bundles_inner_table">
              <thead>
                <tr class="integration_bundles_inner_table_header_row integration_bundles_inner_table_row">
                  <th>Job Name</th>
                  <th>Event Source</th>
                  <th>Event Type</th>
                  <th>Status</th>
                  <th v-if="allow_jobspec_update">Update</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="job in job_specs" :key="job.uuid" class="integration_bundles_inner_table_body_row">
                  <td>{{ job.name }}</td>
                  <td>{{ job.event_source }}</td>
                  <td>{{ job.event_type }}</td>

                  <td>
                    <span class="integration_bundles_inner_table_body_row_installed_span" :style="{
                      backgroundColor: job.installed ? '#e3fcef' : '#fff4e5',
                      color: job.installed ? '#0b875b' : '#e65100'}">
                      {{ job.installed ? 'Installed' : 'Not Installed' }}
                    </span>
                  </td>
                  <td v-if="allow_jobspec_update">
                    <button v-if="!job.installed" @click="install_button_clicked(job.name)"
                      :class="{'btn-loading': is_loading}" 
                      :disabled="is_loading">Install</button>
                    <button v-else @click="uninstall_button_clicked(job.name)"
                      :class="{'btn-loading': is_loading}" 
                      :disabled="is_loading">Uninstall</button>
                    </td>
                  </tr>
                  <tr v-if="job_specs.length === 0">
                    <td colspan="5" style="text-align: center; padding: 15px; color: #888;">
                      No job specifications available for this bundle.
                    </td>
                  </tr>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    `
}