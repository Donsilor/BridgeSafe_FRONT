
<template>
  <model-gltf
    ref="modelGltf"
    src="static/models/gltf/Duck/glTF-Binary/map.glb"
    v-loading="loading"
    @on-load="loading = false"
    :cameraPosition="cameraPosition"
    :width="width"
    :height="height"
  >
  </model-gltf>
</template>

<script>
  import ModelGltf from '@/components/model/model-gltf.vue'

  export default {
    props: {
      width: {
        type: Number
      },
      height: {
        type: Number
      }
    },
    components: {
      ModelGltf
    },
    data () {
      return {
        loading: true,
        cameraPosition: {x: 0.07412337841979776, y: 0.35039827116840616, z: 0.0861628307381405}
      }
    },
    methods: {
      father () {
        this.$refs.modelGltf.getWindowSize()
      }
    }
  }
</script>
