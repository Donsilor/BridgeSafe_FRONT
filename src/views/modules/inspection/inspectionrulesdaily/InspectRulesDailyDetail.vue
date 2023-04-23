<template>
  <div>
    <el-dialog title="查看日常巡查制度" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="120px">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="制度编码 : ">
              {{ inputForm.code }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="制度名称 : ">
              {{ inputForm.name }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目 : "> {{ inputForm.bridgeName }} {{ inputForm.bridgeBranchName }} </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="制度频率(1次) : ">{{ inputForm.rate }} {{ inputForm.rateUnit }} </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否打卡 : ">
              {{ $dictUtils.getDictLabel('yes_no', inputForm.needCheckpoint, '否') }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巡查组 : ">
              {{ inputForm.orgNames }}
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注 : ">
              {{ inputForm.remark }}
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="0">
              <el-tabs v-model="inspectRulesDailyTab">
                <el-tab-pane label="巡查项目">
                  <el-table size="small" border :data="inputForm.inspectRulesItemsDailyList" style="width: 100%">
                    <el-table-column prop="code" header-align="center" align="center" show-overflow-tooltip label="编码"> </el-table-column>
                    <el-table-column prop="name" header-align="center" align="center" show-overflow-tooltip label="巡查项目"> </el-table-column>
                    <el-table-column prop="count" header-align="center" align="center" show-overflow-tooltip label="构件数量"> </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane v-if="inputForm.needCheckpoint === '1'" label="打卡列表">
                  <el-table size="small" border :data="inputForm.inspectRulesCheckpointsDailyList" style="width: 100%">
                    <el-table-column prop="code" header-align="center" align="center" show-overflow-tooltip label="打卡点编码"> </el-table-column>
                    <el-table-column prop="name" header-align="center" align="center" show-overflow-tooltip label="打卡点名称"> </el-table-column>
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      loading: false,
      inspectRulesDailyTab: '0',
      inputForm: {},
    };
  },
  watch: {
    'inputForm.needCheckpoint': function (val) {
      if (val === '0') {
        this.inspectRulesDailyTab = '0';
      }
    },
  },
  methods: {
    init(id) {
      this.visible = true;
      this.$nextTick(() => {
        this.inspectRulesDailyTab = '0';
        this.loading = true;
        this.$http({
          url: `/inspectionrulesdaily/inspectRulesDaily/queryById?id=${id}`,
        }).then(({ data }) => {
          const itemDailyList = [],
            pointDailyList = [];
          this.inputForm = data.inspectRulesDaily;
          data.inspectRulesDaily.inspectRulesCheckpointsDailyList.map((item) => {
            pointDailyList.push({ ...item, code: item.checkpointCode, name: item.checkpointName, id: item.checkpointId });
          });
          data.inspectRulesDaily.inspectRulesItemsDailyList.map((item) => {
            itemDailyList.push({ ...item, code: item.itemCode, name: item.itemName, id: item.itemId });
          });
          this.inputForm.inspectRulesCheckpointsDailyList = pointDailyList;
          this.inputForm.inspectRulesItemsDailyList = itemDailyList;
          this.loading = false;
        });
      });
    },
  },
};
</script>