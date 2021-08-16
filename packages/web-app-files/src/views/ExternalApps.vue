<template>
  <main>
    <div>
      <iframe v-if="app_url && method === 'GET'" class="app-iframe" :src="app_url" />

      <div v-if="app_url && method === 'POST' && form_parameters">
        <form :action="app_url" target="app-iframe" method="post">
          <div v-for="(item, key, index) in form_parameters" :key="index">
            <input :name="key" :value="item" type="hidden" />
          </div>
        </form>
      </div>
      <span id="frameholder"></span>
    </div>
  </main>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ExternalApps',
  data: () => ({
    app: '',
    file_id: '',
    app_url: '',
    method: '',
    form_parameters: {}
  }),
  computed: {
    ...mapGetters(['getToken'])
  },

  watch: {
    form_parameters(val, oldVal) {
      if (val && this.method === 'POST') {
        const frameholder = document.getElementById('frameholder')
        const frame = document.createElement('iframe')
        frame.name = 'app-iframe'
        frame.id = 'app-iframe'

        // The title should be set for accessibility
        frame.title = 'App Frame'

        // This attribute allows true fullscreen mode in slideshow view
        // when using PowerPoint's 'view' action.
        frame.setAttribute('allowfullscreen', 'true')

        // The sandbox attribute is needed to allow automatic redirection to the O365 sign-in page in the business user flow
        frame.setAttribute(
          'sandbox',
          'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-popups-to-escape-sandbox'
        )
        frameholder.appendChild(frame)
      }
    }
  },

  mounted() {
    document.title = this.$route.params.app
  },

  async created() {
    console.log('route', this.$route.params)
    // this.test = this.$router.params.userId

    try {
      this.app = this.$route.params.app
      this.file_id = this.$route.params.file_id

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const url = '/app/open?file_id=' + this.file_id + '&app_name=' + this.app
      const response = await fetch(url, {
        method: 'POST',
        headers
      })
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`
        throw new Error(message)
      }

      const data = await response.json()

      if (data.app_url) this.app_url = data.app_url
      if (data.method) this.method = data.method
      if (data.form_parameters) this.form_parameters = data.form_parameters

      console.log('post data', data)
    } catch (error) {
      console.log(error)
    }
  },

  methods: {
    ...mapActions(['showMessage'])
  }
}
</script>
<style scoped>
.app-iframe {
  width: 100vw;
  height: 98vh;
}
#files-view-options-btn,
#web-nav-sidebar,
.oc-sidebar {
  display: none !important;
}
</style>
