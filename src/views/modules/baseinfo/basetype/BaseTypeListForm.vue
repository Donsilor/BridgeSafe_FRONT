<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" :class="method === 'view' ? 'readonly' : ''" :disabled="method === 'view'" label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="数据编码" prop="code">
              <el-input v-model="inputForm.code" placeholder="请填写数据编码" maxlength="10" minlength="1" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="数据名称"
              prop="name"
              :rules="[
                { required: true, message: '数据名称不能为空', trigger: 'blur' },
                { min: 1, message: '最小长度是1个字符', trigger: 'blur' },
              ]"
            >
              <el-input v-model="inputForm.name" placeholder="请填写参数名称" maxlength="15" minlength="1"></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="参数状态" prop="status"
                :rules="[
                  {required: true, message:'参数状态不能为空', trigger:'blur'}
                 ]">
                    <el-radio-group v-model="inputForm.status">
                        <el-radio v-for="item in $dictUtils.getDictList('enable_status')" :label="item.value" :key="item.value" :disabled="disabled">{{item.label}}</el-radio>
                    </el-radio-group>
           </el-form-item>
        </el-col> -->
          <el-col :span="12">
            <el-form-item
              label="数据层级"
              prop="level"
              :rules="[
                { required: true, message: '层级不能为空', trigger: 'blur' },
                { validator: validator.isIntGtZero, trigger: 'blur' },
              ]"
            >
              <el-input v-model="inputForm.level" placeholder="请填写层级" maxlength="2" minlength="1" max="99" min="1"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark" :rules="[{ min: 0, message: '最小长度是0个字符', trigger: 'blur' }]">
              <el-input type="textarea" v-model="inputForm.remark" placeholder="请填写备注" maxlength="255" minlength="0"></el-input>
            </el-form-item>
          </el-col>
          <!--        <el-col :span="12">-->
          <!--            <el-form-item label="排序" prop="sort"-->
          <!--                :rules="[-->
          <!--                 ]">-->
          <!--              <el-input v-model="inputForm.sort" placeholder="请填写排序"></el-input>-->
          <!--           </el-form-item>-->
          <!--        </el-col>-->
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
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      disabled: false,
      loading: false,
      inputForm: {
        id: '',
        code: '',
        name: '',
        status: '1',
        level: '',
        remark: '',
        sort: '',
      },
    };
  },
  components: {},
  methods: {
    init(method, id) {
      this.method = method;
      this.inputForm.id = id;
      if (method === 'add') {
        this.title = `新建基础参数设置`;
      } else if (method === 'edit') {
        this.disabled = true;
        this.title = '修改基础参数设置';
      } else if (method === 'view') {
        this.title = '查看基础参数设置';
      }
      this.visible = true;
      this.loading = false;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true;
          this.$http({
            url: `/baseinfo/basetype/baseTypeList/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.baseTypeList);
            this.loading = false;
          });
        } else if (method === 'add') {
          this.loading = true;
          this.$http({
            url: `/baseinfo/basetype/baseTypeList/getMaxCode`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm.code = data.maxCode;
            this.disabled = false;
            this.loading = false;
          });
        }
      });
    },
    // 表单提交
    doSubmit() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/baseinfo/basetype/baseTypeList/save`,
            method: 'post',
            data: this.inputForm,
          }).then(({ data }) => {
            this.loading = false;
            if (data && data.success) {
              this.visible = false;
              this.$message.success(data.msg);
              this.$emit('refreshDataList');
            }
          });
        }
      });
    },
  },
};
</script>
