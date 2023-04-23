<template>
  <el-dialog :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
    <div slot="title">
      <el-row> 生成任务({{ row.name }}) <span style="color: red; font-size: 14px"> [* 任务起止时间默认为 00:00:00 和 23:59:59]</span> </el-row>
    </div>
    <el-form :model="form" ref="inputForm" @keyup.enter.native="doSubmit()" label-width="120px">
      <el-row :gutter="15">
        <el-col :span="12">
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
      row: {},
      visible: false,
      loading: false,
      form: {
        time: [this.getStartTime(), this.getEndTime()],
      },
      pickerOptions: {
        disabledDate(v) {
          return v.getTime() < new Date().getTime() - 86400000;
        },
      },
    };
  },
  methods: {
    getStartTime() {
      var data = new Date();
      var Da = new Date(data.getTime());
      var y = Da.getFullYear();
      var m = Da.getMonth() + 2;
      m = m < 10 ? '0' + m : m;
      return y + '-' + m + '-' + '01' + ' ' + '00' + ':' + '00' + ':' + '00';
    },
    getEndTime() {
      var data = new Date();
      var Da = new Date(data.getTime());
      var y = Da.getFullYear();
      return y + '-' + 12 + '-' + '31' + ' ' + '23' + ':' + '59' + ':' + '59';
    },
    init(row) {
      this.visible = true;
      this.row = row;
      this.id = row.id;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
      });
    },
    // 表单提交
    doSubmit() {
      const { time } = this.form;
      this.$refs['inputForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: `/routinerules/inspectRulesRoutine/checkMessage`,
            params: { id: this.id },
          }).then(({ data }) => {
            if (data && data.success) {
              this.$confirm(data.prompt || '确定生成任务吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
                .then(() => {
                  this.loading = true;
                  this.$http({
                    url: '/routinerulesinstance/inspectRulesInstanceRoutine/batchAdd',
                    method: 'post',
                    data: {
                      rulesRoutineId: this.id,
                      planStartTime: moment(time[0]).format('YYYY-MM-DD'),
                      planEndTime: moment(time[1]).format('YYYY-MM-DD'),
                    },
                  })
                    .then(({ data }) => {
                      if (data && data.success) {
                        this.visible = false;
                        this.$message.success(data.msg);
                        this.$emit('refreshDataList');
                      }
                      this.loading = false;
                    })
                    .catch(() => {
                      this.loading = false;
                    });
                })
                .catch(() => {
                  this.loading = false;
                });
            }
          });
        }
      });
    },
  },
};
</script>