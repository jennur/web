<template>
  <div>
    <ul
      v-if="highlightedFile.extension && appList.length > 0"
      id="oc-files-actions-sidebar"
      class="uk-list oc-mt-s"
    >
      <li v-for="(app, index) in appList" :key="`app-${index}`" class="oc-py-xs pointer">
        <div :class="['oc-text-bold']" @click="getLink(app)">
          <img :src="app.icon" :alt="app.name" class="oc-icon-m" />
          <span class="oc-files-actions-sidebar-action-label">{{ 'Open in ' + app.name }}</span>
        </div>
      </li>
    </ul>
    <ul id="oc-files-actions-sidebar" class="uk-list oc-mt-s oc-files-actions-sidebar-actions">
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
    }
  },
  watch: {
    highlightedFile(val, oldVal) {
      // is triggered whenever the store state changes
      this.loadApps()
    }
  },

  created() {
    this.loadApps()
  },
  methods: {
    getLink(app) {
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
    async loadApps() {
      let data
      /* const response = await fetch('/app/list', {
        method: 'GET'
      })
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`
        throw new Error(message)
      }
      data = await response.json()
      console.log('get data', data) */

      const url = 'remote.php/dav/files/' + this.user.id + this.highlightedFile.path

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const resp = await fetch(url, { method: 'PROPFIND', headers })
      if (!resp.ok) {
        const message = `An error has occured: ${resp.status}`
        throw new Error(message)
      }

      const prop = await resp.text()

      const a = prop.match(new RegExp('<d:getcontenttype>' + '(.*)' + '</d:getcontenttype>'))

      const mimetype = a[0].split('<d:getcontenttype>')[1].split('</d:getcontenttype>')[0]
      console.log('mimetype', mimetype)
      if (!data) {
        data = {
          'mime-types': {
            'application/compressed-markdown': {
              app_providers: [
                {
                  address: 'localhost:17000',
                  name: 'CodiMD',
                  icon: 'https://avatars.githubusercontent.com/u/48181221?s=200&v=4'
                }
              ]
            },
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
            'application/octet-stream': {
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
                },
                {
                  address: 'localhost:17000',
                  name: 'CodiMD',
                  icon: 'https://avatars.githubusercontent.com/u/48181221?s=200&v=4'
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
            'application/vnd.lotus-1-2-3': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.ms-excel': {
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
            'application/vnd.ms-excel.sheet.binary.macroEnabled.12': {
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
            'application/vnd.ms-excel.sheet.macroEnabled.12': {
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
            'application/vnd.ms-excel.template.macroEnabled.12': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.ms-powerpoint': {
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
            'application/vnd.ms-powerpoint.presentation.macroEnabled.12': {
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
            'application/vnd.ms-powerpoint.slideshow.macroEnabled.12': {
              app_providers: [
                {
                  address: 'localhost:18000',
                  name: 'MS Office 365',
                  icon:
                    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg'
                }
              ]
            },
            'application/vnd.ms-powerpoint.template.macroEnabled.12': {
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
            'application/vnd.ms-word.document.macroEnabled.12': {
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
            'application/vnd.ms-word.template.macroEnabled.12': {
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
            'application/vnd.ms-works': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.oasis.opendocument.graphics': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.oasis.opendocument.graphics-template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.oasis.opendocument.presentation': {
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
            'application/vnd.oasis.opendocument.presentation-template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.oasis.opendocument.spreadsheet': {
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
            'application/vnd.oasis.opendocument.spreadsheet-template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.oasis.opendocument.text': {
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
            'application/vnd.oasis.opendocument.text-master': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.oasis.opendocument.text-template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.oasis.opendocument.text-web': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
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
            'application/vnd.openxmlformats-officedocument.presentationml.slideshow': {
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
            'application/vnd.openxmlformats-officedocument.presentationml.template': {
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
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
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
            'application/vnd.openxmlformats-officedocument.spreadsheetml.template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
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
            'application/vnd.openxmlformats-officedocument.wordprocessingml.template': {
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
            'application/vnd.palm': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.sun.xml.calc': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.sun.xml.calc.template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.sun.xml.draw': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.sun.xml.draw.template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            }
          }
        }
      }

      if (data['mime-types'][mimetype] && data['mime-types'][mimetype].app_providers)
        this.appList = data['mime-types'][mimetype].app_providers
      else this.appList = []
      return data['mime-types'][mimetype].app_providers
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
.pointer {
  cursor: pointer;
}
.oc-files-actions-sidebar-actions {
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
