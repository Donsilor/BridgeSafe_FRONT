<template>
<div>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    v-dialogDrag
    :visible.sync="visible">
    <el-form :model="inputForm" ref="inputForm" v-loading="loading" :class="method==='view'?'readonly':''"  :disabled="method==='view'"
             label-width="120px">
      <el-row  :gutter="15">
        <el-col :span="12">
            <el-form-item label="位置" prop="location"
                :rules="[
                  {required: true, message:'位置不能为空', trigger:'blur'}
                 ]">
              <el-input v-model="inputForm.location" placeholder="请填写位置"     ></el-input>
           </el-form-item>
        </el-col>
        <el-col :span="24">
            <el-form-item label="图片" prop="picturePath"
                :rules="[
                 ]">
              <el-upload ref="picturePath"
              v-if="visible"
              list-type="picture-card"
                    :action="`${this.$http.BASE_URL}/sys/file/webupload/upload?uploadPath=/bridgecomponentlocation/bridgeComponentLocation`"
                    :headers="{token: $cookie.get('token')}"
                    :on-preview="(file, fileList) => {
                        $alert(`<img style='width:100%' src=' ${(file.response && file.response.url) || file.url}'/>`,  {
                          dangerouslyUseHTMLString: true,
                          showConfirmButton: false,
                          closeOnClickModal: true,
                          customClass: 'showPic'
                        });
                    }"
                    :on-success="(response, file, fileList) => {
                       inputForm.picturePath = fileList.map(item => (item.response && item.response.url) || item.url).join('|')
                    }"
                    :on-remove="(file, fileList) => {
                      $http.post(`/sys/file/webupload/deleteByUrl?url=${(file.response && file.response.url) || file.url}`).then(({data}) => {
                        $message.success(data.msg)
                      })
                      inputForm.picturePath = fileList.map(item => item.url).join('|')
                    }"
                    :before-remove="(file, fileList) => {
                      return $confirm(`确定移除 ${file.name}？`)
                    }"
                    multiple
                    :limit="5"
                    :on-exceed="(files, fileList) =>{
                      $message.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
                    }"
                    :file-list="picturePathArra">
                    <i class="el-icon-plus"></i>
                  </el-upload>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="备注" prop="remark"
                :rules="[
                 ]">
              <el-input v-model="inputForm.remark" placeholder="请填写备注"     ></el-input>
           </el-form-item>
        </el-col>
        </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" v-if="method != 'view'" @click="doSubmit()" v-noMoreClick>确定</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
  export default {
    data () {
      return {
        title: '',
        method: '',
        visible: false,
        loading: false,
        picturePathArra: [],
        inputForm: {
          id: '',
          location: '',
          picturePath: '',
          remark: ''
        }
      }
    },
    components: {
    },
    methods: {
      init (method, obj) {
        this.method = method
        this.inputForm.id = obj.id
        if (method === 'add') {
          this.title = '新建桥梁构件位置'
        } else if (method === 'addChild') {
          this.title = '添加下级桥梁构件位置'
        } else if (method === 'edit') {
          this.title = '修改桥梁构件位置'
        } else if (method === 'view') {
          this.title = '查看桥梁构件位置'
        }
        this.picturePathArra = []
        this.visible = true
        this.loading = false
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          this.inputForm.parent.id = obj.parent.id
          this.inputForm.parent.name = obj.parent.name
          if (method === 'edit' || method === 'view') { // 修改或者查看
            this.loading = true
            this.$http({
              url: `/bridgecomponentlocation/bridgeComponentLocation/queryById?id=${this.inputForm.id}`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm = this.recover(this.inputForm, data.bridgeComponentLocation)
              this.inputForm.picturePath.split('|').forEach((item) => {
                if (item.trim().length > 0) {
                  this.picturePathArra.push({name: decodeURIComponent(item.substring(item.lastIndexOf('/') + 1)), url: item})
                }
              })
              this.loading = false
            })
          }
        })
      },
      // 表单提交
      doSubmit () {
        this.$refs['inputForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            this.$http({
              url: `/bridgecomponentlocation/bridgeComponentLocation/save`,
              method: 'post',
              data: this.inputForm
            }).then(({data}) => {
              this.loading = false
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                this.$emit('refreshTree')
              }
            })
          }
        })
      }
    }
  }
</script>
