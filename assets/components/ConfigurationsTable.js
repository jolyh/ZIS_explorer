export default {
  props: ['filtered_configurations', 'allow_config_update', 'is_loading'],
  emits: ['edit', 'merge', 'delete', 'copy_to_clipboard'],
  setup(props, ctx) {

    const modalActions = {
      editConfiguration: (scope) => ctx.emit('edit', scope),
      mergeConfiguration: (scope) => ctx.emit('merge', scope),
      deleteConfiguration: (scope) => ctx.emit('delete', scope)
    }

    const copyButtonClicked = (content) => {
      ctx.emit('copy_to_clipboard', JSON.stringify(content, null, 2));
    }

    const toggleConfigExpansion = (index) => {
      const configRows = document.getElementsByClassName('config-row')
      const expandedConfigRows = document.getElementsByClassName('config-expanded-content')

      if (configRows[index].classList.contains('expanded-row')) {
        configRows[index].classList.remove('expanded-row')
        expandedConfigRows[index].style.display = 'none'
      } else {
        configRows[index].classList.add('expanded-row')
        expandedConfigRows[index].style.display = 'table-row'
      }
    }

    return { modalActions, toggleConfigExpansion, copyButtonClicked }
  },
  template: `
      <table class="config-table">
        <thead>
          <tr>
            <th>Scope</th>
            <th>Content</th>
            <th v-if="allow_config_update" class="button_column">Manage</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading state -->
          <tr v-if="is_loading">
            <td colspan="3">
              <div class="loader-container">
                <div class="loader"></div>
              </div>
            </td>
          </tr>
          <template v-else-if="filtered_configurations && filtered_configurations.length" v-for="(config, index) in filtered_configurations" :key="index">
            <!-- Configuration row -->
            <tr class="config-row" @click="toggleConfigExpansion(index)" colspan="3">
              <td>{{ config.scope }}</td>
              <td class="config-content">{{ config }}</td>
              <td v-if="allow_config_update" class="button_column">
                <div class="table_buttons_container">
                  <button class="icon-button config-button-edit" @click.stop="modalActions.mergeConfiguration(config.scope)"
                    title="Update">
                    <svg>
                      <use xlink:href="./icons/edit.svg#edit_icon"></use>
                    </svg>
                  </button>
                  <button class="icon-button config-button-replace" @click.stop="modalActions.editConfiguration(config.scope)"
                    title="Replace">
                    <svg>
                      <use xlink:href="./icons/replace.svg#replace_icon"></use>
                    </svg>
                  </button>
                  <button class="icon-button config-button-delete"
                    @click.stop="modalActions.deleteConfiguration(config.scope)" title="Delete">
                    <svg>
                      <use xlink:href="./icons/delete.svg#delete_icon"></use>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <!-- Expanded content row -->
            <tr class="expanded-row-content config-expanded-content" style="display: none;">
              <td colspan="3">
                <button @click="copyButtonClicked(config)" class="config-copy-button" title="Copy to clipboard">
                  <svg>
                    <use xlink:href="./icons/copy.svg#copy_icon"></use>
                  </svg>
                </button>
                <pre>{{ JSON.stringify(config, null, 2) }}</pre>
              </td>
            </tr>
          </template>
          <tr v-else class="no-data">
            <td colspan="3">
              No configurations found for this integration.
            </td>
          </tr>
        </tbody>
      </table>
    `
}