<template>
  <div>
    <ul
      v-if="highlightedFile.extension && appActions"
      id="oc-files-actions-sidebar"
      class="uk-list oc-mt-s"
    >
      <li v-for="(action, index) in appActions" :key="`app-${index}`" class="oc-py-xs">
        <div :class="['oc-text-bold', action.class]" @click="getLink(action)">
          <oc-icon :name="image" size="medium" />
          <span class="oc-files-actions-sidebar-action-label">{{ 'Open in ' + action }}</span>
          <span
            v-if="action.opensInNewWindow"
            class="oc-invisible-sr"
            v-text="$gettext('(Opens in new window)')"
          />
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
    async getLink(appName) {
      console.log(appName)
      let data = {
        file_id: this.highlightedFile.fileId || this.highlightedFile.id,
        app_name: appName
      }

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const response = await fetch('/app/open', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`
        throw new Error(message)
      }

      data = await response.json()
      console.log('got post response', data, data['app-url'])
      if (data && data['app-url']) window.open(data['app-url'], '_blank').focus()
    },

    async loadApps() {
      let data

      const response = await fetch('/app/list', {
        method: 'GET'
      })
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`
        throw new Error(message)
      }

      data = await response.json()
      console.log('get data', data)

      /* if (!data) {
        data = {
          mime_types: {
            'application/msword': {
              app_provider_name: ['Collabora', 'Microsoft Office 365']
            },
            'application/octet-stream': {
              app_provider_name: ['Collabora', 'Microsoft Office 365']
            },
            'application/pdf': {
              app_provider_name: ['Microsoft Office 365']
            },
            'application/rtf': {
              app_provider_name: ['Collabora', 'Microsoft Office 365']
            },
            'application/doc': {
              app_provider_name: ['Collabora', 'Microsoft Office 365']
            }
          }
        }} */

      const appList = []
      for (const [key, value] of Object.entries(data.mime_types)) {
        appList.push({ extension: key.split('/')[1], apps: value.app_provider_name })
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
