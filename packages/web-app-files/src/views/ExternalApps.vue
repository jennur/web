<template>
  <main>
    <div>
      test iframe {{ params.app.name }}
      <iframe
        v-if="params.app.name === 'CodiMD' && app_url && method === 'GET'"
        class="app-iframe-codimd"
        :src="app_url"
      />
    </div>
  </main>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ExternalApps',
  data: () => ({
    params: {},
    app_url: '',
    method: '',
    form_parameters: {}
  }),
  computed: {
    ...mapGetters(['getToken'])
  },

  async created() {
    // this.test = this.$router.params.userId

    try {
      this.params = JSON.parse(localStorage.app_params)

      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const url = '/app/open?file_id=' + this.params.file_id + '&app_name=' + this.params.app.name
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
.app-iframe-codimd {
  width: 100vw;
  height: 98vh;
}
.web-nav-sidebar {
  display: none !important;
}
#body {
}
</style>
