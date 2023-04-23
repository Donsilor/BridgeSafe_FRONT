<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="5">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-tag closable size="small" style="margin-bottom: 5px" v-if="selectOfficeName" :disable-transitions="false" @close="delTag(tag)">
            {{ selectOfficeName }}
          </el-tag>
          <!-- <el-input placeholder="输入桥梁进行过滤" size="small" v-model="filterText"> </el-input> -->
          <el-tree class="filter-tree" :data="treeData" :filter-node-method="filterNode" :expand-on-click-node="false" @node-click="handleNodeClick" ref="officeTree"> </el-tree>
        </el-card>
      </el-col>
      <el-col :span="19">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
            <el-form-item prop="name">
              <el-input size="small" v-model="searchForm.name" placeholder="打卡点名称" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
              <el-button @click="resetSearch()" size="small">重置</el-button>
            </el-form-item>
          </el-form>
          <el-row>
            <el-button v-if="hasPermission('sys:user:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
            <el-button v-if="hasPermission('sys:user:del')" type="danger" size="small" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0" plain>删除 </el-button>
            <el-button type="primary" size="small" @click="getErCode()" :disabled="dataListSelections.length <= 0" plain>下载二维码 </el-button>
            <el-button-group class="pull-right">
              <el-tooltip class="item" effect="dark" content="搜索" placement="top">
                <el-button type="default" size="small" icon="el-icon-search" @click="(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"> </el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="刷新" placement="top">
                <el-button type="default" size="small" icon="el-icon-refresh" @click="setRefresh"> </el-button>
              </el-tooltip>
            </el-button-group>
          </el-row>
          <el-table :data="dataList" v-loading="loading" @selection-change="selectionChangeHandle" size="medium" class="table">
            <el-table-column type="selection" header-align="center" align="center" width="50"> </el-table-column>
            <el-table-column prop="code" sortable="custom" min-width="100" show-overflow-tooltip label="打卡点编码"> </el-table-column>
            <el-table-column prop="name" sortable="custom" min-width="100" show-overflow-tooltip label="打卡点名称"> </el-table-column>
            <el-table-column prop="location" sortable="custom" min-width="120" show-overflow-tooltip label="打卡点位置"> </el-table-column>
            <el-table-column prop="createUserName" sortable="custom" min-width="120" show-overflow-tooltip label="创建人"> </el-table-column>
            <el-table-column prop="createDate" sortable="custom" min-width="120" show-overflow-tooltip label="创建日期"> </el-table-column>
            <el-table-column prop="remark" sortable="custom" show-overflow-tooltip min-width="80" label="备注"> </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="200" label="操作">
              <template slot-scope="scope">
                <el-button v-if="hasPermission('sys:user:edit')" type="text" size="small" icon="el-icon-edit" @click="edit(scope.row.id)">修改</el-button>
                <el-button v-if="hasPermission('sys:user:del')" type="text" size="small" icon="el-icon-delete" @click="del(scope.row.id)">删除</el-button>
                <!-- <el-button type="text" size="small" @click="getErCode(scope.row.id)">下载二维码 </el-button> -->
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
            :current-page="pageNo"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            :total="total"
            background
            layout="total, sizes, prev, pager, next, jumper"
          >
          </el-pagination>
        </el-card>
      </el-col>
    </el-row>
    <!-- 弹窗, 新增 / 修改 -->
    <InspectCheckpointForm ref="InspectCheckpointForm" @refreshDataList="refreshList"></InspectCheckpointForm>
  </div>
</template>

<script>
import InspectCheckpointForm from './InspectCheckpointForm.vue';
export default {
  data() {
    return {
      searchForm: {
        name: '',
        bridgeId: '',
      },
      isShow: true,
      filterText: '',
      dataList: [],
      treeData: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      dataListSelections: [],
      isSearchCollapse: false,
      isImportCollapse: false,
      selectOfficeName: '',
      bridgeName: '',
      loading: false,
    };
  },
  components: {
    InspectCheckpointForm,
  },
  activated() {
    this.refreshTree();
    this.refreshList();
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val);
    },
  },
  computed: {
    contentViewHeight() {
      let height = this.$store.state.common.documentClientHeight - 122;
      return { minHeight: height + 'px' };
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/inspection/inspectCheckpoint/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          ...this.searchForm,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list;
          this.total = data.page.count;
          this.loading = false;
        }
      });
    },
    // 获取树列表
    refreshTree() {
      this.$http({
        url: `/bridge/bridge/treeData`,
        params: {
          status: '1',
        },
      }).then(({ data }) => {
        const treeData = [];
        data.bridgeList.map((item) => {
          treeData.push({ name: item.name, id: item.id });
        });
        function rewriteKey(val) {
          val.forEach((item) => {
            item.label = item.name;
            item.value = item.id;
            if (item.bridgeList?.length) {
              item.children = item.bridgeList;
            }
            if (item.bridgeBranchList?.length) {
              item.children = item.bridgeBranchList;
            }
            if (item.children?.length || item.bridgeList?.length || item.bridgeBranchList?.length) {
              rewriteKey(item.children);
            }
          });
        }
        rewriteKey(data.bridgeList);
        this.treeData = data.bridgeList;
      });
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
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增
    add() {
      if (!this.searchForm.bridgeId) {
        this.$message.error('请先选择桥梁或者桥梁分支后新增！');
        return;
      }
      this.$refs.InspectCheckpointForm.init('add', this.searchForm.bridgeId);
    },
    // 修改
    edit(id) {
      this.$refs.InspectCheckpointForm.init('edit', id);
    },
    // 删除
    del(id) {
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/inspection/inspectCheckpoint/delete',
          method: 'post',
          params: { ids: ids },
        }).then(({ data }) => {
          this.loading = false;
          if (data && data.success) {
            this.$message.success({ dangerouslyUseHTMLString: true, message: data.msg });
            this.refreshList();
          }
        });
      });
    },
    getErCode() {
      let ids = this.dataListSelections
        .map((item) => {
          return item.id;
        })
        .join(',');
      this.$http({
        url: `/inspection/inspectCheckpoint/getErCode`,
        params: { ids, bridgeName: this.bridgeName },
      }).then(({ data }) => {
        if (data && data.success) {
          let a = document.createElement('a');
          a.href = data.url.replace('/root/SAUpload', '');
          a.click();
        }
      });
    },
    handleNodeClick(data) {
      //用bridgeType判断是否为桥梁分支,组合桥需要选择桥梁分支，非组合桥选到桥梁级别
      if (data.bridgeType || (data.baseTypeName && data.baseTypeName !== '组合体系桥')) {
        this.searchForm.bridgeId = data.id;
        this.selectOfficeName = '已选: ' + data.name;
        this.bridgeName = data.name;
        this.refreshList();
      } else {
        this.searchForm.bridgeId = '';
        this.selectOfficeName = '';
        this.refreshList();
      }
    },
    delTag() {
      this.searchForm.bridgeId = '';
      this.selectOfficeName = '';
      this.refreshList();
    },
    resetSearch() {
      this.$refs.searchForm.resetFields();
      this.refreshList();
    },
    setRefresh() {
      this.refreshTree();
      this.refreshList();
    },
  },
};
</script>
