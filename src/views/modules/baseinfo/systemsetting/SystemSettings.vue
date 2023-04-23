<template>
  <div class="page">
    <el-row>
      <el-button type="primary" size="small" icon="el-icon-collection" @click="saveSettings()">保存
      </el-button>
    </el-row>
    <el-form>
      <el-row class="settingGroup">
        <el-row class="title">通用设置</el-row>
        <el-row>
          <el-checkbox v-model="inputForm.pos" :disabled="disabledFlag">检查必须开启定位</el-checkbox>
        </el-row>
      </el-row>
      <el-row class="settingGroup">
        <el-row class="title">日常巡查设置</el-row>
        <el-row>
           提前<el-input size="small" class="settingInput" v-model="inputForm.dailyAheadDays" :disabled="disabledFlag"></el-input>天生成巡查任务
        </el-row>
        <el-row>
          <el-checkbox v-model="inputForm.dailyAllChecked" :disabled="disabledFlag">巡查任务是否全部打卡</el-checkbox>
        </el-row>
        <el-row>
          <el-checkbox v-model="inputForm.dailyAutoGenTask" :disabled="disabledFlag">是否自动下发巡查任务</el-checkbox>
        </el-row>
        <el-row>
          <el-checkbox v-model="inputForm.dailyNeedAudit" :disabled="disabledFlag">病害是否需要审核</el-checkbox>
        </el-row>
      </el-row>
      <el-row class="settingGroup">
        <el-row class="title">经常检查设置</el-row>
        <el-row>
          提前<el-input  size="small" class="settingInput" v-model="inputForm.routineAheadDays" :disabled="disabledFlag"></el-input>天生成检查任务
        </el-row>
        <el-row>
          <el-checkbox v-model="inputForm.routineNeedPhoto" :disabled="disabledFlag">正常构件是否需要拍照</el-checkbox>
        </el-row>
        <el-row>
          <el-checkbox v-model="inputForm.routineAutoGenTask" :disabled="disabledFlag">是否自动下发检查任务</el-checkbox>
        </el-row>
        <el-row>
          <el-checkbox v-model="inputForm.routineNeedAudit" :disabled="disabledFlag">病害是否需要审核</el-checkbox>
        </el-row>
      </el-row>
    </el-form>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        inputForm: {
          pos: true,

          dailyAheadDays: '7',
          dailyAllChecked: true,
          dailyAutoGenTask: true,
          dailyNeedAudit: true,

          routineAheadDays: '7',
          routineNeedPhoto: true,
          routineAutoGenTask: true,
          routineNeedAudit: true
        },
        dataList: [],
        dataListSelections: [],
        loading: false,
        disabledFlag: true
      }
    },
    components: {},
    activated() {
      this.initSettings()
    },
    methods: {
      // 初始化系统设置页面
      initSettings() {
        this.loading = true
        this.$http({
          url: '/syssetting/sysSetting/getlist',
          method: 'get',
          params: {}
        }).then(({data}) => {
          if (data && data.success) {
            this.dataList = data.list
            this.dataList.forEach(setting => {
              switch (setting.code) {
                case 'must_open_position':
                  this.inputForm.pos = setting.value1 === '1'
                  break
                case 'daily_advance_days':
                  this.inputForm.dailyAheadDays = setting.value1
                  break
                case 'daily_all_checked':
                  this.inputForm.dailyAllChecked = setting.value1 === '1'
                  break
                case 'daily_auto_assign':
                  this.inputForm.dailyAutoGenTask = setting.value1 === '1'
                  break
                case 'daily_auto_audit':
                  this.inputForm.dailyNeedAudit = setting.value1 === '1'
                  break
                case 'routine_advance_days':
                  this.inputForm.routineAheadDays = setting.value1
                  break
                case 'routine_normal_comp_need_photo':
                  this.inputForm.routineNeedPhoto = setting.value1 === '1'
                  break
                case 'routine_auto_assign':
                  this.inputForm.routineAutoGenTask = setting.value1 === '1'
                  break
                case 'routine_auto_audit':
                  this.inputForm.routineNeedAudit = setting.value1 === '1'
                  break
                default:
                  this.inputForm.pos = true
                  this.inputForm.dailyAheadDays = '7'
                  this.inputForm.dailyAllChecked = true
                  this.inputForm.dailyAutoGenTask = true
                  this.inputForm.dailyNeedAudit = true
                  this.inputForm.routineAheadDays = '7'
                  this.inputForm.routineNeedPhoto = true
                  this.inputForm.routineAutoGenTask = true
                  this.inputForm.routineNeedAudit = true
                  break
              }
              ;
            })
            this.loading = false
            this.disabledFlag = false
          }
        })
      },
      // 保存系统设置
      saveSettings() {
        this.loading = true
        this.$http({
          url: '/syssetting/sysSetting/saveSettings',
          method: 'post',
          params: {
            ...this.inputForm
          }
        }).then(({data}) => {
          if (data && data.success) {
            this.loading = false
            this.$message.success('系统设置保存成功。')
          } else {
            this.$message.error(data.msg)
          }
        })
      }
    }
  }
</script>
<style lang="less" scoped>
.page{
  .settingGroup {
    padding: 20px;
    margin: 18px;
    margin-left: 0;
    border: 1px solid #EFEFEF;
    border-radius: 5px;
    line-height: 35px;
    color: #424242;
    .title{
      font-size: 20px;
      font-weight: 400;
      color: #000000;
    }
  }
  .settingInput {
    width: 80px;
    margin: 0 10px;
  }
}

</style>


