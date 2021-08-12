<template>
  <main>
    <div>
      test iframe {{ params.app.name }}
      <iframe />
    </div>
  </main>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ExternalApps',
  data: () => ({
    params: {}
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
#body {
}
</style>
