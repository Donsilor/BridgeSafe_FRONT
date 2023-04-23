<template>
  <el-dialog :title="title" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
    <el-form v-if="title == `新增巡查项目`" :inline="true" ref="searchForm" :model="searchForm" @submit.native.prevent>
      <!-- 搜索框-->
      <el-form-item prop="name">
        <el-input size="small" v-model="searchForm.name" placeholder="请输入巡查项目" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="refreshListItem()" size="small">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table v-if="title == `新增巡查项目`" :data="dataList1" border @selection-change="selectionChangeHandle" v-loading="loading" size="medium" class="table">
      <el-table-column type="selection" header-align="center" align="center" width="50"> </el-table-column>
      <el-table-column prop="code" show-overflow-tooltip sortable="custom" label="巡查项目编码"> </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip sortable="custom" label="巡查项目名称"> </el-table-column>
      <el-table-column prop="count" show-overflow-tooltip sortable="custom" label="构件数量"> </el-table-column>
    </el-table>
    <el-table v-if="title == `新增打卡列表`" :data="dataList2" border @selection-change="selectionChangeHandle" v-loading="loading" size="medium" class="table">
      <el-table-column type="selection" header-align="center" align="center" width="50"> </el-table-column>
      <el-table-column prop="code" show-overflow-tooltip sortable="custom" label="打卡点编码"> </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip sortable="custom" label="打卡点名称"> </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="doSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      type: '',
      visible: false,
      loading: false,
      searchForm: {
        name: '',
      },
      dataList1: [],
      dataList2: [],
      dataListSelections: [],
      propList: [],
    };
  },
  methods: {
    init(name, bridgeId, propList) {
      if (name === '巡查项目') {
        this.title = `新增巡查项目`;
        this.type = 'inspectRulesItemsDailyList';
        this.refreshListItem();
      } else {
        this.title = `新增打卡列表`;
        this.type = 'inspectRulesCheckpointsDailyList';
        this.refreshListPoint(bridgeId);
      }
      this.propList = propList;
      this.visible = true;
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 获取巡查项目列表
    refreshListItem() {
      this.loading = true;
      this.$http({
        url: '/inspectitemdaily/inspectItemDaily/list',
        method: 'get',
        params: {
          pageNo: 1,
          pageSize: 1000,
          ...this.searchForm,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList1 = data.page.list.filter((item) => !this.propList.map((v) => v.id).includes(item.id));
          this.loading = false;
        }
      });
    },
    // 获取打卡点列表
    refreshListPoint(bridgeId) {
      this.loading = true;
      this.$http({
        url: '/inspection/inspectCheckpoint/list',
        method: 'get',
        params: {
          pageNo: 1,
          pageSize: 1000,
          bridgeId,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList2 = data.page.list.filter((item) => !this.propList.map((v) => v.id).includes(item.id));
          this.loading = false;
        }
      });
    },
    //点击确定
    doSubmit() {
      if (!this.dataListSelections.length) {
        this.$message.error('请选择数据！');
      } else {
        this.$emit('addRow', this.dataListSelections, this.type);
        this.visible = false;
      }
    },
  },
};
</script>
