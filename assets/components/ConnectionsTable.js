export default {
    props: ['connections', 'connection_filter', 'is_loading'],
    emits: ['', ''],
    setup(props, ctx) {

        const toggleConnectionExpansion = (index) => {
            const connectionRows = document.getElementsByClassName('connection-row')
            const expandedConnectionRows = document.getElementsByClassName('connection-expanded-content')

            if (connectionRows[index].classList.contains('expanded-row')) {
                connectionRows[index].classList.remove('expanded-row')
                expandedConnectionRows[index].style.display = 'none'
            } else {
                connectionRows[index].classList.add('expanded-row')
                expandedConnectionRows[index].style.display = 'table-row'
            }
        }

        return { toggleConnectionExpansion }
    },
    template: `
        <table class="connections-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading state -->
              <tr v-if="is_loading">
                <td colspan="2">
                  <div class="loader-container">
                    <div class="loader"></div>
                  </div>
                </td>
              </tr>
              <template v-else v-for="(connection, index) in connections[connection_filter]" :key="index">
                <tr class="connection-row" @click="toggleConnectionExpansion(index)">
                  <td>{{ connection.name }}</td>
                  <td>{{ connection }}</td>
                </tr>
                <!-- Expanded content row -->
                <tr class="expanded-row-content connection-expanded-content" style="display: none;">
                  <td colspan="2" >
                    <pre>{{ JSON.stringify(connection, null, 2) }}</pre>
                  </td>
                </tr>
              </template>
              <tr v-if="!is_loading && connections[connection_filter] && connections[connection_filter].length === 0" class="no-data">
                <td colspan="2">No {{ connection_filter }} connections found for this integration.</td>
              </tr>
            </tbody>
          </table>
    `
}