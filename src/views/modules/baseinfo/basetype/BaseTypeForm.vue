<template>
  <div>
    <el-dialog
      :title="title"
      :close-on-click-modal="false"
      v-dialogDrag
      :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" :class="method==='view'?'readonly':''"
               :disabled="method==='view'"
               label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="父级" prop="parent.id"
                          :rules="[
                 ]">
              <SelectTree
                ref="parent"
                :props="{
                          value: 'id',             // ID字段名
                          label: 'name',         // 显示名称
                          children: 'children'    // 子级字段名
                        }"
                v-if="visible"
                :url="`/baseinfo/basetype/baseType/treeData?extId=${inputForm.id}`"
                :value="inputForm.parent.id"
                :clearable="true"
                :accordion="true"
                @getValue="(value) => {inputForm.parent.id=value}"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数代码" prop="code">
              <el-input v-model="inputForm.code" placeholder="请填写参数代码" maxlength="10" minlength="1"
                        :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数名称" prop="name"
                          :rules="[
                  {required: true, message:'参数名称不能为空', trigger:'blur'},
                  { min: 1, message: '最小长度是1个字符', trigger: 'blur' }
                 ]">
              <el-input v-model="inputForm.name" placeholder="请填写参数名称" maxlength="15" minlength="1"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="brakeageFlag">
            <el-form-item label="报损率" prop="breakageRate" :rules="rules1">
              <el-input v-model="inputForm.breakageRate" maxlength="5" placeholder="请输入报损率">
                <i slot="suffix" style="font-style:normal;margin-right: 10px;">%</i>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="colorFlag">
            <el-form-item label="坐标颜色" prop="posColor">
              <el-radio-group v-model="inputForm.posColor">
                <el-radio v-for="item in $dictUtils.getDictList('pos_color')" :label="item.value" :key="item.value">
                  {{item.label}}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="videoFlag">
            <el-form-item label="是否可删除" :rules="[
                  {required: true, message:'必选是否可以被删除', trigger:'blur'}
                 ]">
              <el-checkbox v-model="inputForm.canDelete"></el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="videoFlag">
            <el-form-item label="是否拍摄视频" prop="needVideo"
                          :rules="[
                  {required: true, message:'是否拍摄视频不能为空', trigger:'blur'}
                 ]">
              <el-switch v-model="inputForm.isNeedVideo" @change="changeNeedVideo"></el-switch>
              <el-select v-model="inputForm.videoType" v-if="inputForm.isNeedVideo" @change="changeNeedVideo">
                <el-option label="手机拍照" value="3" default></el-option>
                <el-option label="手机录像" value="2"></el-option>
                <el-option label="监控录像" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="videoFlag && videoDurationVisible">
            <el-form-item label="视频时长" prop="videoDuration"
                          :rules="videoDurationRules">
              <el-input v-model="inputForm.videoDuration" placeholder="请填写视频时长" maxlength="10" minlength="1"></el-input>
            </el-form-item>
          </el-col>
          <!--        <el-col :span="12">-->
          <!--            <el-form-item label="参数状态" prop="status"-->
          <!--                :rules="[-->
          <!--                  {required: true, message:'参数状态不能为空', trigger:'blur'}-->
          <!--                 ]">-->
          <!--                    <el-radio-group v-model="inputForm.status">-->
          <!--                        <el-radio v-for="item in $dictUtils.getDictList('enable_status')" :label="item.value" :key="item.value" :disabled="disabled">{{item.label}}</el-radio>-->
          <!--                    </el-radio-group>-->
          <!--           </el-form-item>-->
          <!--        </el-col>-->

          <el-col v-if="videoFlag" :span="12">
            <el-form-item label="按钮顺序" prop="sort" :rules="[{validator: validator.isDigits, trigger:'blur'}]">
              <el-input v-model="inputForm.buttonSort" placeholder="请填写按钮排序"></el-input>
            </el-form-item>
          </el-col>

          <el-col v-if="this.$store.state.user.id == 1 && videoFlag" :span="12">
            <el-form-item prop="buttonImage" label="按钮图片" :rules="[{required: true, message:'图片不能为空', trigger:'blur'}]">
              <el-upload
                list-type="picture-card"
                :action="`${this.$http.BASE_URL}/sys/file/webupload/upload?uploadPath=baseLivespan`"
                :headers="{token: $cookie.get('token')}"
                :on-success="handleAvatarSuccess"
                :limit="1"
                :file-list="fileList"
                :on-exceed="(files, fileList) =>{$message.warning(`仅允许上传一张图片请不要多次上传！`)}"
                :on-remove="handleRemove"
                :show-file-list="true"
                :class="[showUploadBtn ? '' : 'hidden-Btn']"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="备注" prop="remark"
                          :rules="[
                  { min: 0, message: '最小长度是0个字符', trigger: 'blur' }
                 ]">
              <el-input type="textarea" v-model="inputForm.remark" placeholder="请填写备注" maxlength="255"
                        minlength="0"></el-input>
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
  import SelectTree from '@/components/treeSelect/treeSelect.vue'
  import validator from '@/utils/validator'

  export default {
    data() {
      const validateRange = (rule, value, callback) => {
        if (!value) {
          callback()
        }
        const reg1 = /^[-+]?\d+$/
        const reg2 = /^[-+]?\d+(\.\d+)?$/
        const result = reg1.test(value) || reg2.test(value)
        if (!result || (parseFloat(value) <= 0 || parseFloat(value) > 20)) {
          callback(new Error('请输入20以内的数值!'))
        } else {
          callback()
        }
      }
      const validateVideoDuration = (rule, value, callback) => {
        if (this.inputForm.isNeedVideo && this.inputForm.videoType === '2') {
          if (this.inputForm.videoDuration && this.inputForm.videoDuration > 60) {
            callback(new Error('手机录像最大输入60'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
      return {
        rules1: [
          {validator: validateRange, trigger: 'blur'}
        ],
        videoDurationRules: [
          {required: true, message: '视频时长不能为空', trigger: 'blur'},
          {validator: validator.isIntGtZero, trigger: 'blur'},
          {validator: validateVideoDuration, trigger: 'blur'}
        ],
        title: '',
        method: '',
        visible: false,
        disabled: false,
        loading: false,
        fileList: [],
        inputForm: {
          id: '',
          parent: {
            id: ''
          },
          code: '',
          name: '',
          breakageRate: '',
          posColor: '',
          status: '1',
          remark: '',
          sort: '',
          needVideo: '0',
          isNeedVideo: false,
          videoType: '',
          videoDuration: 0,
          buttonSort: 1,
          buttonImage: '',
          displayStatus: true,
          canDelete: false
        },
        brakeageFlag: false,
        colorFlag: false,
        videoFlag: false,
        videoDurationVisible: false,
        showUploadBtn: true
      }
    },
    components: {
      SelectTree
    },
    methods: {
      init(method, obj) {
        if (obj.topParentCode === 'BT101') {
          this.colorFlag = true
        } else {
          this.colorFlag = false
        }

        if (obj.topParentCode === 'BT144') {
          this.videoFlag = true
        } else {
          this.videoFlag = false
        }

        this.method = method
        this.inputForm.id = obj.id
        this.fileList = []
        this.inputForm.buttonImage = ''
        this.inputForm.canDelete = false

        if (method === 'add') {
          this.title = '新建基础参数'
        } else if (method === 'addChild') {
          this.title = '添加下级基础参数'
        } else if (method === 'edit') {
          this.title = '修改基础参数'
          this.disabled = true
        } else if (method === 'view') {
          this.title = '查看基础参数'
        }
        this.brakeageFlag = false
        this.visible = true
        this.loading = false
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          this.inputForm.parent.id = obj.parent.id
          this.inputForm.parent.name = obj.parent.name
          if (method === 'edit' || method === 'view') { // 修改或者查看
            this.loading = true
            this.$http({
              url: `/baseinfo/basetype/baseType/queryById?id=${this.inputForm.id}`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm = this.recover(this.inputForm, data.baseType)
              if (obj.topParentCode === 'BT118' && (!data.baseType.children || (data.baseType.children && data.baseType.children.length === 0))) {
                // 实际作物
                this.brakeageFlag = true
              }
              this.initNeedVideo()
              if (this.inputForm.buttonImage) {
                this.fileList.push({name: '作业类型图标', url: this.inputForm.buttonImage})
                this.showUploadBtn = false
              } else {
                this.showUploadBtn = true
              }
              this.loading = false
            })
          } else if (method === 'addChild') {
            this.loading = true
            this.$http({
              url: `/baseinfo/basetype/baseTypeList/getMaxCode`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm.code = data.maxCode
              // this.inputForm.status = '0'
              this.inputForm.posColor = 'green'
              this.disabled = false
              this.loading = false
            })
          }
        })
      },
      // 表单提交
      doSubmit() {
        this.fileList.length > 0 ? this.inputForm.buttonImage = this.fileList[0].url : this.inputForm.buttonImage = ''
        this.$refs['inputForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            if (this.fileList[0]) {
              this.inputForm.buttonImage = this.fileList[0].url
            }
            this.$http({
              url: `/baseinfo/basetype/baseType/save`,
              method: 'post',
              data: this.inputForm
            }).then(({data}) => {
              this.loading = false
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                this.$emit('refreshTree', data.id)
              }
            })
          }
        })
      },
      initNeedVideo() {
        if (this.inputForm.needVideo === '0' || this.inputForm.needVideo === '3') {
          this.videoDurationVisible = false
          this.inputForm.isNeedVideo = false
        } else {
          this.videoDurationVisible = true
          this.inputForm.isNeedVideo = true
          this.inputForm.videoType = this.inputForm.needVideo
        }
      },
      changeNeedVideo() {
        if (this.inputForm.isNeedVideo && this.inputForm.videoType !== '3') {
          this.videoDurationVisible = true
        } else {
          this.videoDurationVisible = false
        }
        this.setNeedVideo()
      },
      setNeedVideo() {
        if (!this.inputForm.isNeedVideo) {
          this.inputForm.needVideo = '0'
        } else {
          if (!this.inputForm.videoType) {
            this.inputForm.needVideo = ''
          } else {
            this.inputForm.needVideo = this.inputForm.videoType
          }
        }
      },
      handleAvatarSuccess(res, file) {
        this.fileList[0] = {url: res.url, name: '作业按钮图'}
        this.showUploadBtn = false
      },
      handleRemove() {
        this.fileList = []
        this.showUploadBtn = true
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type.indexOf('image/') >= 0
        const isLt2M = file.size / 1024 / 1024 < 4

        if (!isJPG) {
          this.$message.error('只能上传照片!')
          return false
        }
        if (!isLt2M) {
          this.$message.error('上传照片大小不能超过 4MB!')
          return false
        }
        return true
      }
    }
  }
</script>
<style scoped lang="scss">
  .hidden-Btn {
    ::v-deep .el-upload {
      display: none;
    }
  }
</style>
