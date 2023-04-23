<template>
  <el-dialog :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
    <div slot="title">
      <el-row> 生成任务({{ inputForm.name }}) <span style="color: red; font-size: 14px"> [* 任务起止时间默认为 00:00:00 和 23:59:59]</span> </el-row>
    </div>
    <el-form :model="form" ref="inputForm" @keyup.enter.native="doSubmit()" label-width="120px">
      <el-row :gutter="15">
        <el-col :span="24">
          <el-form-item label="任务日期" prop="time" :rules="[{ required: true, message: '任务日期不能为空', trigger: 'blur' }]">
            <el-date-picker v-model="form.time" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" align="right" :picker-options="pickerOptions"> </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" :loading="loading" @click="doSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      id: '',
      visible: false,
      loading: false,
      form: {
        time: [new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000, new Date(new Date().toLocaleDateString()).getTime() + (2 * 24 * 60 * 60 * 1000 - 1)],
        // time: [new Date(new Date().toLocaleDateString()).getTime(), new Date(new Date().toLocaleDateString()).getTime()],
      },
      inputForm: {},
      pickerOptions: {
        disabledDate(v) {
          return v.getTime() < new Date().getTime() - 86400000;
        },
      },
    };
  },
  methods: {
    init(id) {
      this.visible = true;
      this.loading = true;
      this.id = id;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.$http({
          url: `/inspectionrulesdaily/inspectRulesDaily/queryById?id=${id}`,
          method: 'get',
        }).then(({ data }) => {
          this.inputForm = data.inspectRulesDaily;
          this.loading = false;
        });
      });
    },
    // 表单提交
    doSubmit() {
      const { time } = this.form;
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http({
            url: `/dailyinspectruleinstance/inspectRulesInstance/batchAdd`,
            method: 'post',
            data: {
              rulesDailyId: this.id,
              planStartTime: moment(time[0]).format('YYYY-MM-DD'),
              planEndTime: moment(time[1]).format('YYYY-MM-DD'),
            },
          })
            .then(({ data }) => {
              this.loading = false;
              if (data && data.success) {
                this.visible = false;
                this.$message.success(data.msg);
                this.$emit('refreshDataList');
              }
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
  },
};
</script>