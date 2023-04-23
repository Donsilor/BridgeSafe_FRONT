<template>
  <el-dialog
    title="新增文件"
    :close-on-click-modal="false"
    destroy-on-close
    v-dialogDrag
    :visible.sync="fileDialogVisible"
    append-to-body>
    <el-form :model="fileForm" ref="fileForm" label-width="120px">
      <el-row :gutter="15">
        <el-col :span="16">
          <el-form-item label="档案分类" prop="fileType.id"
                        :rules="[
                  {required: true, message:'档案分类不能为空', trigger:'blur'}
                 ]">
            <SelectTree
              :props="{
                          value: 'id',             // ID字段名
                          label: 'name',         // 显示名称
                          children: 'children'    // 子级字段名
                        }"
              :data="classificationTree"
              :value="fileForm.fileType.id"
              :clearable="false"
              :accordion="true"
              @getValue="(value) => {
                fileForm.fileType.id=value
              }"/>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="档案别名" prop="fileAlias">
            <el-input v-model="fileForm.fileAlias" placeholder="请输入" maxlength="10" minlength="1"
                      :disabled="fileList.length > 1"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <div>
            <el-upload
              :action="`${this.$http.BASE_URL}/sys/file/webupload/upload?uploadPath=baseLivespan`"
              :headers="{token: $cookie.get('token')}"
              :on-success="handleFileSuccess"
              :limit="5"
              multiple
              :file-list="fileList"
              :before-upload="beforeFileUpload"
              :on-exceed="(files, fileList) =>{$message.warning(`超过文件最大数量限制`)}"
              :on-remove="handleRemove"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">文件大小不能超过50M，最多同时批量上传5个文件</div>
            </el-upload>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
              <el-button @click="fileDialogVisible = false">关闭</el-button>
              <el-button type="primary" @click="submitFile()">保存</el-button>
            </span>
  </el-dialog>
</template>

<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue'

const getDefaultFileForm = () => ({
  fileType: {
    id: '',
    name: ''
  },
  fileAlias: ''
})
export default {
  props: {
    classificationTree: Array
  },
  data() {
    return {
      fileDialogVisible: false,
      loading: false,
      fileList: [],
      fileForm: getDefaultFileForm()
    }
  },
  components: {
    SelectTree
  },
  methods: {
    init(params) {
      this.fileDialogVisible = true
      this.fileForm = getDefaultFileForm()
      this.fileList = []
    },
    handleFileSuccess(res, file, fileList) {
      console.log('handleFileSuccess', res, file, fileList)
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      console.log('handleRemove', file, fileList)
      this.fileList = fileList
    },
    beforeFileUpload(file) {
      const isLt50M = file.size / 1024 / 1024 < 50;

      if (!isLt50M) {
        this.$message.error('上传的文件大小不能超过50MB!');
      }
      return isLt50M;
    },
    submitFile() {
      const self = this
      this.$refs['fileForm'].validate((valid) => {
        if (valid) {
          if (self.fileList.length === 0) {
            self.$message.warning('至少上传一个文件')
            return
          }
          self.fileDialogVisible = false
          const name = getNameFromTree(self.fileForm.fileType.id, self.classificationTree)
          const _fileList = self.fileList.map(item => ({
            id: item.id,
            fileName: item.name,
            filePath: item.response.url,
            fileType: {
              id: self.fileForm.fileType.id,
              name
            },
            fileAlias: self.fileForm.fileAlias
          }))
          self.$emit('submitFileUpload', {
            fileList: _fileList
          })
        }
      })
    }
  }
}

function getNameFromTree(id, treeData) {
  function iter(item, list) {
    list.push(item)
    if (Array.isArray(item.children)) {
      item.children.forEach(obj => iter(obj, list))
    }
  }

  const totalList = []
  treeData.forEach(item => iter(item, totalList))
  const target = totalList.find(item => item.id === id)
  return target.name
}
</script>

<style scoped>

</style>
