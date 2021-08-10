<template>
  <div>
    <ul
      v-if="highlightedFile.extension && appActions"
      id="oc-files-actions-sidebar"
      class="uk-list oc-mt-s"
    >
      <li v-for="(action, index) in appActions" :key="`app-${index}`" class="oc-py-xs">
        <div :class="['oc-text-bold', action.class]" @click="getLink(action)">
          <img :src="action.icon" :alt="action.name" class="oc-icon-m" />
          <span class="oc-files-actions-sidebar-action-label">{{ 'Open in ' + action.name }}</span>
        </div>
      </li>
    </ul>
    <ul id="oc-files-actions-sidebar" class="uk-list oc-mt-s">
      <li v-for="(action, index) in actions" :key="`action-${index}`" class="oc-py-xs">
        <component
          :is="action.componentType"
          v-bind="getComponentProps(action, highlightedFile)"
          :class="['oc-text-bold', action.class]"
          @click.stop="action.handler(highlightedFile, action.handlerData)"
        >
          <oc-icon :name="action.icon" size="medium" />
          <span class="oc-files-actions-sidebar-action-label">{{
            action.label(highlightedFile)
          }}</span>
          <span
            v-if="action.opensInNewWindow"
            class="oc-invisible-sr"
            v-text="$gettext('(Opens in new window)')"
          />
        </component>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import FileActions from '../../../mixins/fileActions'

export default {
  name: 'ActionsAccordion',
  title: $gettext => {
    return $gettext('Actions')
  },
  mixins: [FileActions],
  data: () => ({
    appList: []
  }),
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFolder']),

    actions() {
      const actions = this.$_fileActions_editorActions.concat(this.$_fileActions_systemActions)

      return actions.filter(action =>
        action.isEnabled({
          resource: this.highlightedFile,
          parent: this.currentFolder
        })
      )
    },
    appActions() {
      const foundApps = this.loadApps().filter(
        app => app.extension === this.highlightedFile.extension
      )
      console.log('highlighted from appactions', this.highlightedFile)
      console.log(foundApps)
      return foundApps.length > 0 && foundApps[0].apps ? foundApps[0].apps : false
    }
  },

  methods: {
    async getLink(app) {
      // const route = this.$router.resolve({ path: '/files/list/apps' })

      localStorage.app_params = JSON.stringify({
        app,
        file_id: this.highlightedFile.fileId || this.highlightedFile.id
      })
      const routeData = this.$router.resolve({
        path: '/files/list/apps'
      })

      window.open(routeData.href, '_blank')
    },

    loadApps() {
      let data

      if (!data) {
        data = {
          mime_types: {
            'application/msword': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                },
                {
                  address: 'localhost:18000',
                  name: 'MS Office 365',
                  icon:
                    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg'
                }
              ]
            },

            'application/pdf': {
              app_providers: [
                {
                  address: 'localhost:18000',
                  name: 'MS Office 365',
                  icon:
                    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg'
                }
              ]
            },
            'application/rtf': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                },
                {
                  address: 'localhost:18000',
                  name: 'MS Office 365',
                  icon:
                    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg'
                }
              ]
            },
            'application/doc': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                },
                {
                  address: 'localhost:18000',
                  name: 'MS Office 365',
                  icon:
                    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg'
                }
              ]
            }
          }
        }
      }

      const appList = []
      for (const [key, value] of Object.entries(data.mime_types)) {
        appList.push({ extension: key.split('/')[1], apps: value.app_providers })
      }
      return appList
    },
    getComponentProps(action, highlightedFile) {
      if (action.componentType === 'router-link' && action.route) {
        return {
          to: {
            name: action.route,
            params: {
              item: highlightedFile.path
            }
          }
        }
      }

      return {
        appearance: 'raw'
      }
    }
  }
}
</script>

<style lang="scss">
.popup {
  position: absolute;
  width: 800px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: black;
}

#oc-files-actions-sidebar {
  > li a,
  > li a:hover {
    text-decoration: none;
    color: var(--oc-color-swatch-passive-default);
    display: inline-flex;
    gap: 10px;
    vertical-align: top;
  }
}
</style>
