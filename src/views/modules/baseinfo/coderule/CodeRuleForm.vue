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
            <el-form-item label="业务类型" prop="bizType"
                :rules="[
                  {required: true, message:'业务类型不能为空', trigger:'blur'}
                 ]">
                <el-select v-model="inputForm.bizType" placeholder="请选择"  style="width: 100%;">
                          <el-option
                            v-for="item in codeArr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                      </el-select>
           </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务编码">
            <el-input v-model="inputForm.bizType" placeholder="选择业务类型后带出" :disabled="true"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="日期格式" prop="dateformatName"
                :rules="[
                  {required: true, message:'日期格式不能为空', trigger:'blur'}
                 ]">
              <el-select v-model="inputForm.dateformatName" placeholder="请选择"  style="width: 100%;">
                <el-option
                  v-for="item in $dictUtils.getDictList('date_format')"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
           </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="顺序号长度" prop="seqlength"
                :rules="[
                  {required: true, message:'顺序号长度不能为空', trigger:'blur'},
                  {validator: validator.isIntGteZero, trigger:'blur'}
                 ]">
              <el-input v-model="inputForm.seqlength" placeholder="请填写顺序号长度"  maxlength="100"    ></el-input>
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
    // 接受父组件的值
    props: {
      dataList: Array
    },
    data () {
      return {
        title: '',
        method: '',
        codeArr: [],
        visible: false,
        loading: false,
        inputForm: {
          id: '',
          bizType: '',
          dateformat: '',
          dateformatName: '',
          seqlength: ''
        }
      }
    },
    components: {
    },
    methods: {
      init (method, id) {
        this.findDateArr(method)
        this.method = method
        this.inputForm.id = id
        if (method === 'add') {
          this.title = `新建序号生成`
        } else if (method === 'edit') {
          this.title = '修改序号生成'
        } else if (method === 'view') {
          this.title = '查看序号生成'
        }
        this.visible = true
        this.loading = false
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          if (method === 'edit' || method === 'view') { // 修改或者查看
            this.loading = true
            this.$http({
              url: `/baseinfo/coderule/codeRule/queryById?id=${this.inputForm.id}`,
              method: 'get'
            }).then(({data}) => {
              this.inputForm = this.recover(this.inputForm, data.codeRule)
              this.dateToName(this.inputForm.dateformat)
              this.loading = false
            })
          }
        })
      },
      async findDateArr (method) {
        if (method === 'add') {
          let array = this.$dictUtils.getDictList('code_rule')
          let dataList = this.dataList
          this.codeArr = array.filter(item => !dataList.some(ele => ele.bizType === item.value))
        } else if (method === 'view') {
          this.codeArr = this.$dictUtils.getDictList('code_rule')
        }
      },
      // 表单提交
      doSubmit () {
        this.$refs['inputForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            this.dateToCode(this.inputForm.dateformatName)
            this.$http({
              url: `/baseinfo/coderule/codeRule/save`,
              method: 'post',
              data: this.inputForm
            }).then(({data}) => {
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                this.$emit('refreshDataList')
              }
              this.loading = false
            })
          }
        })
      },
      // 日期转换
      dateToCode (type) {
        let data = ''
        if (type === '1') {
          data = 'yyyy'
        }
        if (type === '2') {
          data = 'yyyy-MM'
        }
        if (type === '3') {
          data = 'yyyy-MM-dd'
        }
        if (type === '4') {
          data = 'yyyy-MM-dd HH'
        }
        if (type === '5') {
          data = 'yyyy-MM-dd HH:mm'
        }
        if (type === '6') {
          data = 'yyyy-MM-dd HH:mm:ss'
        }
        this.inputForm.dateformat = data
      },
      dateToName (type) {
        let number = (type.length - 1) / 3
        this.inputForm.dateformatName = number.toString()
      }
    }
  }
</script>
