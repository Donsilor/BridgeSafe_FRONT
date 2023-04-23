<template>
  <div>
    <el-dialog title="绑定病害类型" :close-on-click-modal="false" v-dialogDrag :visible.sync="visible">
      <el-table ref="multipleTable" :data="dataList" border v-loading="loading" size="medium" class="table" @selection-change="selectionChangeHandle">
        <el-table-column type="selection" header-align="center" align="center" width="50"> </el-table-column>
        <el-table-column prop="code" show-overflow-tooltip sortable="custom" label="病害代码"> </el-table-column>
        <el-table-column prop="name" show-overflow-tooltip sortable="custom" label="病害名称"> </el-table-column>
        <el-table-column prop="baseComponentDiseaseList" show-overflow-tooltip sortable="custom" label="构件类型">
          <template slot-scope="scope">
            {{ scope.row.baseComponentDiseaseList.map((v) => v.compName).join() }}
          </template>
        </el-table-column>
        <el-table-column prop="createUserName" show-overflow-tooltip sortable="custom" label="创建人"> </el-table-column>
        <el-table-column prop="createDate" show-overflow-tooltip sortable="custom" label="创建日期"> </el-table-column>
        <el-table-column prop="remark" show-overflow-tooltip sortable="custom" label="备注"> </el-table-column>
      </el-table>
      <!-- <el-pagination
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
      >
      </el-pagination> -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="doSubmit()" v-noMoreClick>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { map } from 'zrender/lib/core/util';

export default {
  data() {
    return {
      visible: false,
      loading: false,
      pageNo: 1,
      pageSize: 1000,
      total: 0,
      compId: '',
      dataList: [],
      dataListSelections: [],
    };
  },
  methods: {
    init(compId, list) {
      this.compId = compId;
      this.visible = true;
      this.loading = true;
      this.$http({
        url: '/basedisease/baseDisease/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list;
          this.total = data.page.count;
          this.$nextTick(() => {
            data.page.list.forEach((row) => {
              list.forEach((selected) => {
                if (selected.diseaseId === row.id) {
                  this.$refs.multipleTable.toggleRowSelection(row, true);
                }
              });
            });
          });
          this.loading = false;
        }
      });
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageNo = 1;
      this.refreshList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val;
      this.refreshList();
    },
    // 表单提交
    doSubmit() {
      console.log({ diseaseId: this.dataListSelections.map((v) => v.id).join(), compIds: this.compId });
      this.$http({
        url: `/basedisease/baseDisease/saveCompDisease`,
        method: 'post',
        data: { type: 'com', diseaseId: this.dataListSelections.map((v) => v.id).join(), compIds: this.compId },
      }).then(({ data }) => {
        this.loading = false;
        if (data && data.success) {
          this.visible = false;
          this.$message.success(data.msg);
          this.$emit('refreshList');
        }
      });
    },
  },
};
</script>