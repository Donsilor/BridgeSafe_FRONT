<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag v-if="visible" :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" :class="method === 'view' ? 'readonly' : ''" :disabled="method === 'view'" label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="上级数据" prop="param.id" :rules="[{ required: true, message: '基础类型不能为空', trigger: 'blur' }]">
              <SelectTree
                disabled
                ref="param"
                :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                url="/baseinfo/basetype/baseType/treeData"
                :value="inputForm.param.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  (value) => {
                    inputForm.param.id = value;
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="数据编码"
              prop="code"
              :rules="[
                { required: true, message: '编码不能为空', trigger: 'blur' },
                { min: 1, message: '最小长度是1个字符', trigger: 'blur' },
                { validator: validator.isRightfulString, trigger: 'blur' },
              ]"
            >
              <el-input v-model="inputForm.code" placeholder="请填写编码" maxlength="32" minlength="1"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="数据名称"
              prop="name"
              :rules="[
                { required: true, message: '名称不能为空', trigger: 'blur' },
                { min: 1, message: '最小长度是1个字符', trigger: 'blur' },
              ]"
            >
              <el-input v-model="inputForm.name" placeholder="请填写名称" maxlength="15" minlength="1"></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="状态" prop="status" :rules="[{ required: true, message: '状态不能为空', trigger: 'blur' }]">
              <el-radio-group v-model="inputForm.status">
                <el-radio v-for="item in $dictUtils.getDictList('yes_no')" :label="item.value" :key="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col> -->
          <el-col :span="12">
            <el-form-item label="备注" prop="remark" :rules="[{ min: 0, message: '最小长度是0个字符', trigger: 'blur' }]">
              <el-input type="textarea" v-model="inputForm.remark" placeholder="请填写备注" maxlength="255" minlength="0"></el-input>
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
import SelectTree from '@/components/treeSelect/treeSelect.vue';
export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      inputForm: {
        id: '',
        param: {
          id: '',
        },
        code: '',
        name: '',
        status: '',
        remark: '',
      },
    };
  },
  components: {
    SelectTree,
  },
  methods: {
    init(method, id, obj) {
      this.method = method;
      this.inputForm = {
        id: '',
        param: {
          id: '',
        },
        code: '',
        name: '',
        status: '',
        remark: '',
      };
      this.inputForm.id = id;
      if (obj !== undefined) {
        this.inputForm.param.id = obj.baseTypeId;
      }
      if (method === 'add') {
        this.title = `新建基础类型的属性`;
      } else if (method === 'edit') {
        this.title = '修改基础类型的属性';
      } else if (method === 'view') {
        this.title = '查看基础类型的属性';
      }
      this.visible = true;
      this.loading = false;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true;
          this.$http({
            url: `/baseinfo/basetype/baseTypeProp/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.baseTypeProp);
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
            url: `/baseinfo/basetype/baseTypeProp/save`,
            method: 'post',
            data: this.inputForm,
          }).then(({ data }) => {
            this.loading = false;
            if (data && data.success) {
              this.visible = false;
              this.$message.success(data.msg);
              this.$refs.inputForm.resetFields();
              this.$emit('refreshDataList');
            }
          });
        }
      });
    },
  },
};
</script>
