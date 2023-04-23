<template>
  <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
    <el-form :model="inputForm" ref="inputForm" :class="method === 'view' ? 'readonly' : ''" :disabled="method === 'view'" @keyup.enter.native="doSubmit()" label-width="120px">
      <el-row :gutter="15">
        <!-- <el-col :span="12">
          <el-form-item label="属性编码" prop="code" :rules="[{ required: true, message: '属性编码不能为空' }]">
            <el-input v-model="inputForm.code" placeholder="请填写编码" disabled></el-input>
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="属性名称" prop="name" :rules="[{ required: true, message: '属性名称不能为空' }]">
            <el-input v-model="inputForm.name" placeholder="请填写名称" :disabled="method === 'edit'"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="日常巡查必填" prop="dailyInspectionNeed" :rules="[{ required: true, message: '日常巡查必填不能为空', trigger: 'blur' }]">
            <el-select v-model="inputForm.dailyInspectionNeed" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in this.$dictUtils.getDictList('yes_no')" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="经常检查必填" prop="offenInspectionNeed" :rules="[{ required: true, message: '经常检查必填不能为空', trigger: 'blur' }]">
            <el-select v-model="inputForm.offenInspectionNeed" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in this.$dictUtils.getDictList('yes_no')" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="属性类型" prop="paramType" :rules="[{ required: true, message: '属性类型不能为空', trigger: 'blur' }]">
            <el-select v-model="inputForm.paramType" placeholder="请选择" style="width: 100%" @change="paramTypeFun" :disabled="method === 'edit'">
              <el-option v-for="item in ['文本', '数值', '选择', '单选“是/否”', '日期']" :key="item" :label="item" :value="item"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="属性定义" prop="paramValue" :rules="method === 'edit' ? [] : paramValueRules">
            <el-input v-model="inputForm.paramValue" :placeholder="method === 'edit' ? '' : paramValuPla" :disabled="method === 'edit'"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="sort">
            <el-input type="number" v-model="inputForm.sort"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="inputForm.remark" placeholder="请填写备注"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <!-- <el-button v-if="method === 'add'" type="primary" @click="continueDoSubmit()">继续添加</el-button> -->
      <el-button @click="visible = false">关闭</el-button>
      <el-button v-if="method !== 'view'" type="primary" @click="doSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
const RequiredRule = { required: true, message: '属性定义不能为空', trigger: 'blur' }
export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      oldInputForm: '',
      paramValuPla: '请输入',
      paramValueRules: [RequiredRule],
      inputForm: {
        id: '',
        // code: '',
        name: '',
        dailyInspectionNeed: '',
        offenInspectionNeed: '',
        paramType: '',
        paramValue: '',
        remark: '',
        sort: '',
      },
    };
  },
  methods: {
    init(method, obj) {
      this.method = method;
      if (method === 'add') {
        this.title = `新建病害参数`;
      } else if (method === 'edit') {
        this.title = '修改病害参数';
      } else if (method === 'view') {
        this.title = '查看病害参数';
      }
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm.id = '';
        this.oldInputForm = '';
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.oldInputForm = obj;
          this.inputForm = JSON.parse(JSON.stringify(obj));
        }
      });
    },
    // 表单提交
    doSubmit() {
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.$emit('addRow', this.oldInputForm, JSON.parse(JSON.stringify(this.inputForm)));
          this.visible = false;
        }
      });
    },
    paramTypeFun(val) {
      if (val === '文本') {
        this.paramValuPla = '请输入文本内容的最大长度，例：20';
        this.paramValueRules = [RequiredRule, { validator: validate文本, trigger: 'change' }];
      } else if (val === '数值') {
        this.paramValuPla = '请输入数值长度/小数位,例：10/2';
        this.paramValueRules =  [RequiredRule, { validator: validate数字, trigger: 'change' }];
      } else if (val === '选择') {
        this.paramValuPla = '请输入选择值，之间用“,”（半角）间隔。例：A,B,C';
        this.paramValueRules = [RequiredRule, { validator: validate选择, trigger: 'change' }];
      } else {
        this.paramValuPla = '';
        this.paramValueRules = [];
      }
      this.inputForm.paramValue = '';
    },
  },
};
function validate文本(rule, value, callback) {
  if (!value) {
    callback(new Error('属性定义不能为空'));
  } else if (!/^\d+$/.test(value)) {
    callback(new Error('属性定义必须是整数'));
  } else {
    callback();
  }
};
function validate数字(rule, value, callback) {
  if (!value) {
    callback(new Error('属性定义不能为空'));
  } else if (!/^\d+\/\d+$/.test(value)) {
    callback(new Error('输入的格式不正确'));
  } else {
    callback();
  }
};
function validate选择(rule, value, callback) {
  if (!value) {
    callback(new Error('属性定义不能为空'));
  } else if (value.split(',').length < 2) {
    callback(new Error('属性定义必须使用","(半角）分隔'));
  } else {
    callback();
  }
};
</script>
