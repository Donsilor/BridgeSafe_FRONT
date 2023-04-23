<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="5">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-tag closable size="small" style="margin-bottom: 5px" v-if="selectBaseComponentName" :disable-transitions="false" @close="handleNodeClose">
            {{ selectBaseComponentName }}
          </el-tag>
          <el-row :gutter="5">
            <el-col :span="20">
              <el-input placeholder="输入关键字进行过滤" size="small" v-model="filterText"> </el-input>
            </el-col>
          </el-row>
          <el-tree
            class="filter-tree"
            :data="baseComponentTreeData"
            :props="{
              value: 'id', // ID字段名
              label: 'name', // 显示名称
              children: 'children', // 子级字段名
            }"
            :filter-node-method="filterNode"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
            ref="baseComponentTree"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <!-- <span>
                <el-button type="text" class="tree-item-button" icon="el-icon-plus" @click="() => addChildTreeNode()"> </el-button>
              </span> -->
            </span>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="19">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-row>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="() => addChildTreeNode()">绑定病害类型</el-button>
            <el-button-group class="pull-right">
              <el-button type="default" size="small" icon="el-icon-refresh" @click="refreshList"> </el-button>
            </el-button-group>
          </el-row>
          <el-table :data="dataList" border size="medium" v-loading="loading" class="table">
            <el-table-column prop="code" show-overflow-tooltip label="病害类型编码"> </el-table-column>
            <el-table-column prop="disName" show-overflow-tooltip label="病害类型名称"> </el-table-column>
            <el-table-column prop="sort" show-overflow-tooltip label="显示顺序"> </el-table-column>
            <el-table-column header-align="center" align="center" label="操作">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="edit(scope.row)">修改显示顺序</el-button>
              </template>
            </el-table-column>
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
        </el-card>
      </el-col>
    </el-row>
    <!-- 弹窗, 新增 / 修改 -->
    <BaseComponentForm ref="baseComponentForm" @refreshList="refreshList"></BaseComponentForm>
    <BaseComponentMod ref="baseComponentMod" @refreshList="refreshList"></BaseComponentMod>
  </div>
</template>

<script>
import BaseComponentForm from './BaseComponentForm';
import BaseComponentMod from './BaseComponentMod';
import SelectTree from '@/components/treeSelect/treeSelect.vue';
export default {
  data() {
    return {
      searchForm: {
        compId: '',
      },
      filterText: '',
      baseComponentTreeData: [],
      selectBaseComponentName: '',
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      dataListSelections: [],
      isSearchCollapse: false,
      isImportCollapse: false,
      loading: false,
    };
  },
  components: {
    SelectTree,
    BaseComponentForm,
    BaseComponentMod,
  },
  activated() {
    this.refreshTree();
  },
  computed: {
    contentViewHeight() {
      let height = this.$store.state.common.documentClientHeight - 122;
      return { minHeight: height + 'px' };
    },
  },
  watch: {
    filterText(val) {
      this.$refs.baseComponentTree.filter(val);
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    refreshTree() {
      this.$http({
        url: `/basecomponent/baseComponent/treeData`,
        method: 'get',
      }).then(({ data }) => {
        this.baseComponentTreeData = data.treeData;
      });
    },
    handleNodeClick(data) {
      this.searchForm.compId = data.id;
      this.selectBaseComponentName = '已选: ' + data.name;
      this.refreshList();
    },
    handleNodeClose() {
      this.searchForm.compId = '';
      this.selectBaseComponentName = '';
      this.refreshList();
    },
    addChildTreeNode() {
      this.$refs.baseComponentForm.init(this.searchForm.compId, this.dataList);
    },
    edit(row) {
      this.$refs.baseComponentMod.init(row);
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/basedisease/baseDisease/getDisNameList',
        method: 'get',
        params: {
          ...this.searchForm,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.baseComponentDiseases;
          this.loading = false;
        }
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
    resetSearch() {
      this.$refs.searchForm.resetFields();
      this.selectBaseComponentName = '';
      this.refreshList();
    },
  },
};
</script>