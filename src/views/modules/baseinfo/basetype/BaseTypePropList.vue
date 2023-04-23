<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-tag closable size="small" style="margin-bottom: 5px" v-if="selectBaseTypeName" :disable-transitions="false" @close="handleNodeClose">
            {{ selectBaseTypeName }}
          </el-tag>
          <el-row :gutter="5">
            <el-col :span="20">
              <el-input placeholder="输入关键字进行过滤" size="small" v-model="filterText"> </el-input>
            </el-col>
            <!--        <el-col :span="4">-->
            <!--            <el-button type="primary" @click="addTreeNode" size="small" icon="el-icon-plus" circle></el-button>-->
            <!--        </el-col>-->
          </el-row>
          <el-tree
            class="filter-tree"
            :data="baseTypeTreeData"
            node-key="id"
            :props="{
              value: 'id', // ID字段名
              label: 'name', // 显示名称
              children: 'children', // 子级字段名
              parentId: 'parentId',
            }"
            default-expand-all
            :highlight-current="true"
            :filter-node-method="filterNode"
            :expand-on-click-node="true"
            @node-click="handleNodeClick"
            ref="baseTypeTree"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span>
                <el-button type="text" class="tree-item-button" icon="el-icon-plus" @click="() => addChildTreeNode(data)"> </el-button>
                <el-button v-if="data.parentId !== '0'" type="text" class="tree-item-button" icon="el-icon-edit-outline" @click="() => editTreeNode(data)"> </el-button>
                <el-button v-if="data.parentId !== '0'" type="text" class="tree-item-button" icon="el-icon-delete" @click="() => delTreeNode(data)"> </el-button>
                <!-- <el-button v-if="data.parentId !== '0' && data.status === '0'" type="text" class="tree-item-button" icon="el-icon-video-play" @click="() => start(data)"> </el-button>
                <el-button v-if="data.parentId !== '0' && data.status === '1'" type="text" class="tree-item-button" icon="el-icon-video-pause" @click="() => end(data)"> </el-button> -->
              </span>
            </span>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="18" style="display: none">
        <el-card shadow="never" :body-style="contentViewHeight">
          <el-form :inline="true" v-show="isSearchCollapse" class="query-form" ref="searchForm" :model="searchForm" @keyup.enter.native="refreshList()" @submit.native.prevent>
            <!-- 搜索框-->
            <el-form-item prop="param.id">
              <SelectTree
                ref="param"
                :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                size="small"
                url="/baseinfo/basetype/baseType/treeData"
                :value="searchForm.param.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  (value) => {
                    searchForm.param.id = value;
                  }
                "
              />
            </el-form-item>
            <el-form-item prop="code">
              <el-input size="small" v-model="searchForm.code" placeholder="编码" clearable></el-input>
            </el-form-item>
            <el-form-item prop="name">
              <el-input size="small" v-model="searchForm.name" placeholder="名称" clearable></el-input>
            </el-form-item>
            <el-form-item prop="status">
              <el-radio-group v-model="searchForm.status">
                <el-radio v-for="item in $dictUtils.getDictList('yes_no')" :label="item.value" :key="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="createBy.id">
              <el-input size="small" v-model="searchForm.createBy.id" placeholder="创建人" clearable></el-input>
            </el-form-item>
            <el-form-item prop="remark">
              <el-input size="small" v-model="searchForm.remark" placeholder="备注" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="refreshList()" size="small">查询</el-button>
              <el-button @click="resetSearch()" size="small">重置</el-button>
            </el-form-item>
          </el-form>
          <el-row>
            <el-button v-if="hasPermission('baseinfo:basetype:baseTypeProp:add')" type="primary" size="small" icon="el-icon-plus" @click="add()">新建</el-button>
          </el-row>
          <el-table :data="dataList" border size="medium" v-loading="loading" class="table">
            <el-table-column prop="code" show-overflow-tooltip sortable="custom" align="center" label="类型编码">
              <template slot-scope="scope">
                <el-link type="primary" :underline="false" v-if="hasPermission('baseinfo:basetype:baseTypeProp:edit')" @click="edit(scope.row.id)">{{ scope.row.code }}</el-link>
                <el-link type="primary" :underline="false" v-else-if="hasPermission('baseinfo:basetype:baseTypeProp:view')" @click="view(scope.row.id)">{{ scope.row.code }}</el-link>
                <span v-else>{{ scope.row.code }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" show-overflow-tooltip sortable="custom" align="center" label="类型名称"> </el-table-column>
            <!-- <el-table-column prop="status" show-overflow-tooltip sortable="custom" align="center" label="状态">
              <template slot-scope="scope">
                {{ $dictUtils.getDictLabel('enable_status', scope.row.status, '-') }}
              </template>
            </el-table-column> -->
            <!-- <el-table-column prop="parentAttribute" show-overflow-tooltip sortable="custom" width="300" align="center" label="继承属性参数"> </el-table-column> -->
            <el-table-column prop="createBy.name" show-overflow-tooltip sortable="custom" align="center" label="创建人"> </el-table-column>
            <el-table-column prop="updateDate" align="center" show-overflow-tooltip sortable="custom" label="创建时间"> </el-table-column>
            <el-table-column prop="remark" show-overflow-tooltip sortable="custom" align="center" width="200" label="备注"> </el-table-column>
            <el-table-column header-align="center" align="center" fixed="right" width="200" label="操作">
              <template slot-scope="scope">
                <el-button v-if="hasPermission('baseinfo:basetype:baseTypeProp:edit')" type="text" icon="el-icon-edit" size="small" @click="edit(scope.row.id)">修改</el-button>
                <el-button v-if="hasPermission('baseinfo:basetype:baseTypeProp:del')" type="text" icon="el-icon-delete" size="small" @click="del(scope.row.id)">删除</el-button>
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
    <BaseTypePropForm ref="baseTypePropForm" @refreshDataList="refreshList"></BaseTypePropForm>
    <BaseTypeForm ref="baseTypeForm" @refreshTree="refreshTree"></BaseTypeForm>
  </div>
</template>

<script>
import BaseTypePropForm from './BaseTypePropForm';
import BaseTypeForm from './BaseTypeForm';
import SelectTree from '@/components/treeSelect/treeSelect.vue';
export default {
  data() {
    return {
      searchForm: {
        param: {
          id: '',
        },
        code: '',
        name: '',
        status: '',
        createBy: {
          id: '',
        },
        remark: '',
      },
      filterText: '',
      baseTypeTreeData: [],
      selectBaseTypeName: '',
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
      isSearchCollapse: false,
      isImportCollapse: false,
      loading: false,
      nodeParentAll: [],
    };
  },
  components: {
    SelectTree,
    BaseTypePropForm,
    BaseTypeForm,
  },
  mounted() {
    this.refreshTree();
    this.refreshList();
  },
  computed: {
    contentViewHeight() {
      let height = this.$store.state.common.documentClientHeight - 122;
      return { minHeight: height + 'px' };
    },
  },
  watch: {
    filterText(val) {
      this.$refs.baseTypeTree.filter(val);
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    refreshTree(nodeId) {
      const self = this
      this.$http({
        url: `/baseinfo/basetype/baseType/treeData`,
        method: 'get',
      }).then(({ data }) => {
        this.baseTypeTreeData = data.treeData;
        // 定位到这个结点上
        if (nodeId) {
          setTimeout(() => {
            self.$refs.baseTypeTree.setCurrentKey(nodeId);
          }, 200)
        }
      });
    },
    // 获取所有父级节点
    getParentAll(node) {
      if (node) {
        this.nodeParentAll = []
        // 节点的第一个父级
        var parentNode = node.parent
        // level为节点的层级 level=1 为顶级节点
        for (var j = 0, lv = node.level; j < lv; j++) {
          if (parentNode.level > 0) {
            // 将所有父级节点放入集合中
            this.nodeParentAll.push(parentNode)
          }
          // 继续获取父级节点的父级节点
          parentNode = parentNode.parent
        }

        if (this.nodeParentAll.length > 1) {
          // 如果集合长度>1 则将数组进行倒叙.reverse() 其是就是将所有节点按照 从 顶级节点 依次往下排
          this.nodeParentAll.reverse()
        }
      }
    },
    handleNodeClick(data) {
      this.searchForm.param.id = data.id;
      this.selectBaseTypeName = '已选: ' + data.name;
      this.refreshList();
    },
    handleNodeClose() {
      this.searchForm.param.id = '';
      this.selectBaseTypeName = '';
      this.refreshList();
    },
    addChildTreeNode(node) {
      // 如果点击添加按钮的节点不为根节点时，做层级的判断，如果为根节点则不需要判断因为添加根节点时层级必须大于0
      if (node.parentId !== '0') {
        let parentIds = node.parentIds.substr(0, node.parentIds.length - 1);
        let parentIdArray = parentIds.split(',');
        // 根节点id
        let topParentId = parentIdArray[1];
        let topParentData = this.baseTypeTreeData.filter((item) => {
          if (item.id === topParentId) {
            return item;
          }
        });
        // 根节点层级
        let level = topParentData[0].level;
        if (parentIdArray.length >= level + 1) {
          this.$message.info('根节点层深为' + level + '级，新建时不可超过该层深');
          return;
        }
        this.$refs.baseTypeForm.init('addChild', { id: '', parent: { id: node.id, name: node.name }, topParentCode: topParentData[0].code });
      } else {
        this.$refs.baseTypeForm.init('addChild', { id: '', parent: { id: node.id, name: node.name }, topParentCode: node.code });
      }
    },
    // 新增
    addTreeNode() {
      this.$refs.baseTypeForm.init('add', { id: '', parent: { id: '', name: '' } });
    },
    // 修改
    editTreeNode(data) {
      let parentIds = data.parentIds.substr(0, data.parentIds.length - 1);
      let parentIdArray = parentIds.split(',');
      // 根节点id
      let topParentId = parentIdArray[1];
      let topParentData = this.baseTypeTreeData.filter((item) => {
        if (item.id === topParentId) {
          return item;
        }
      });
      this.$refs.baseTypeForm.init('edit', { id: data.id, parent: { id: '', name: '' }, topParentCode: topParentData[0].code });
    },
    // 删除
    delTreeNode(data) {
      this.$confirm(`删除基础参数时，基础参数及其下级配置的参数信息及属性信息也将一起删除，确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/baseinfo/basetype/baseType/delete',
          method: 'delete',
          params: { id: data.id },
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg);
            this.loading = false;
            this.refreshTree();
            this.refreshList();
          }
        });
      });
    },
    // 启用
    start(node) {
      // 所有父级节点启用状态判断
      let parentIds = node.parentIds.substr(0, node.parentIds.length - 1);
      this.$http({
        url: '/baseinfo/basetype/baseType/checkParentStatus',
        method: 'get',
        params: { parentIds: parentIds },
      }).then(({ data }) => {
        if (data && data.checkStatus) {
          this.$confirm(`确定启用所选项吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            this.loading = true;
            this.$http({
              url: '/baseinfo/basetype/baseType/start',
              method: 'get',
              params: { id: node.id, checkStatus: data.checkStatus },
            }).then(({ data }) => {
              if (data && data.success) {
                // this.$message.success(data.msg) // 以后恢复右侧属性列表时使用此提示信息
                this.$message.success('操作成功');
                this.loading = false;
                this.refreshTree();
                this.refreshList();
              }
            });
          });
        } else {
          this.$confirm('该基础参数父节点中有状态为未启用的基础参数,该基础参数启用时会同步把该基础参数父节点中参数同步启用，请确认是否执行该操作？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            this.loading = true;
            this.$http({
              url: '/baseinfo/basetype/baseType/start',
              method: 'get',
              params: { id: node.id, checkStatus: data.checkStatus, parentIds: parentIds },
            }).then(({ data }) => {
              if (data && data.success) {
                // this.$message.success(data.msg) // 以后恢复右侧属性列表时使用此提示信息
                this.$message.success('操作成功');
                this.loading = false;
                this.refreshTree();
                this.refreshList();
              }
            });
          });
        }
      });
    },
    // 停用
    end(data) {
      // this.$confirm(`停用基础参数时，基础参数及其下级配置的参数信息及属性信息也将一起停用，确定停用所选项吗?`, '提示', {
      this.$confirm(`确定停用所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: '/baseinfo/basetype/baseType/end',
          method: 'get',
          params: { id: data.id },
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg);
            this.loading = false;
            this.refreshTree();
            this.refreshList();
          }
        });
      });
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      this.$http({
        url: '/baseinfo/basetype/baseTypeProp/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          orderBy: this.orderBy,
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
      this.$refs.baseTypePropForm.init('add', '', { baseTypeId: this.searchForm.param.id });
    },
    // 修改
    edit(id) {
      id =
        id ||
        this.dataListSelections.map((item) => {
          return item.id;
        })[0];
      this.$refs.baseTypePropForm.init('edit', id);
    },
    // 查看
    view(id) {
      this.$refs.baseTypePropForm.init('view', id);
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
          url: '/baseinfo/basetype/baseTypeProp/delete',
          method: 'delete',
          params: { ids: ids },
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg);
            this.refreshList();
          }
          this.loading = false;
        });
      });
    },
    resetSearch() {
      this.$refs.searchForm.resetFields();
      this.selectBaseTypeName = '';
      this.refreshList();
    },
    checkboxT(row, index) {
      if (row.param.id === this.searchForm.param.id) {
        return 1;
      } else {
        return 0;
      }
    },
    // 启用
    startBaseTypeProp(id) {
      const flag = this.dataListSelections.find((item) => item.status === '1');
      if (flag) {
        return this.$message.info(`所选基础参数中包含已启用状态，请重新选择`);
      }
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$confirm(`确定启动所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http.post(`/baseinfo/basetype/baseTypeProp/startBaseTypeProp?ids=${ids}`).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg);
            this.refreshList();
          }
          this.loading = false;
        });
      });
    },
    // 停用
    stopBaseTypeProp(id) {
      const flag = this.dataListSelections.find((item) => item.status === '0');
      if (flag) {
        return this.$message.info(`所选基础参数中包含已停用状态，请重新选择`);
      }
      let ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(',');
      this.$confirm(`确定停用所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http.post(`/baseinfo/basetype/baseTypeProp/stopBaseTypeProp?ids=${ids}`).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg);
            this.refreshList();
          }
          this.loading = false;
        });
      });
    },
  },
};
</script>
