<template>
  <div :class="['bridge-image-group-root', (fileList.length >= max || readOnly) ?  'readonly':'']">
    <el-upload
      :action="`${this.$http.BASE_URL}/sys/file/webupload/upload?uploadPath=baseLivespan`"
      :headers="{token: $cookie.get('token')}"
      list-type="picture-card"
      :file-list="fileList"
      :limit="6"
      :before-upload="beforeImageUpload"
      :on-success="handleFileSuccess"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove">
      <i class="el-icon-plus"></i>
    </el-upload>
    <div class="image-tips" v-if="!readOnly">只能上传图片，并且大小不能超过50M</div>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    max: Number,
    imageList: Array,
    readOnly: Boolean
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: this.imageList.map(image => ({
        ...image,
        name: image.id,
        url: image.imagePath,
      })),
      showUploadBtn: true
    }
  },
  methods: {
    handleRemove(file, fileList) {
      this.fileList = fileList
      this.$emit('handleRemove', {
        fileList: fileList
      })
    },
    beforeImageUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt50M = file.size / 1024 / 1024 < 50;

      if (!isImage) {
        this.$message.error('只能上传图片');
      }
      if (!isLt50M) {
        this.$message.error('上传的图片大小不能超过50MB!');
      }
      return isImage && isLt50M;
    },
    handleFileSuccess(res, file) {
      console.log('handleFileSuccess', res, file, file.fileName)
      const fileList = this.imageList.slice()
      fileList.push({url: res.url, name: file.name})
      this.$emit('handleFileSuccess', {
        fileList: fileList
      })
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleError ({message}) {
      this.loading = false
    },
  }
}
</script>

<style lang="scss">
.image-tips {
  padding-top: 20px;
}
.bridge-image-group-root.readonly .el-upload--picture-card {
  display: none !important;
}

</style>
