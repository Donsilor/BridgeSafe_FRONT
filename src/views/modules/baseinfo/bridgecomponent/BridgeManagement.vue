<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-tree
          class="filter-tree"
          :data="bridgeList"
          :props="{
            value: 'id', // ID字段名
            label: 'name', // 显示名称
            children: 'children', // 子级字段名
          }"
          default-expand-all
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="handleBridgeClick"
          ref="bridgeCategoryRef"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="6">
        <el-form :inline="true" :model="inputForm" size="mini" ref="inputForm">
          <el-form-item label="">
            <el-input v-model="inputForm.compName" placeholder="构件名称模糊查询"></el-input>
          </el-form-item>
          <el-form-item label="">
            <el-input v-model="inputForm.compCode" placeholder="构件编码精确查询"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onFilterSubmit">查询</el-button>
            <el-button @click="resetFilterForm">重置</el-button>
          </el-form-item>
        </el-form>
        <el-tree
          class="filter-tree"
          :loading="loading"
          :data="compTreeData"
          :props="{
            value: 'id', // ID字段名
            label: 'name', // 显示名称
            children: 'children', // 子级字段名
          }"
          default-expand-all
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="handleCompClick"
          ref="compTreeDataRef"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}{{ data.isInstance || data.isInstanceInfo ? '' : `（${data.instanceCount}）` }}</span>
            <!--             没有子节点的节点才可以添加构件实例-->
            <span v-if="data.isLeaf">
              <el-button type="text" class="tree-item-button" icon="el-icon-circle-plus-outline" @click="() => addNewComp(data)"> </el-button>
              <el-button type="text" class="tree-item-button" icon="el-icon-document-copy" @click="() => addMultipleComp(data)"> </el-button>
            </span>
            <!--             没有子节点的节点才可以添加构件实例-->
            <span v-else-if="data.isInstance">
              <el-button type="text" class="tree-item-button" icon="el-icon-edit" @click="() => editInstance(data)"> </el-button>
              <el-button type="text" class="tree-item-button" icon="el-icon-delete" @click="() => deleteInstance(data)"> </el-button>
            </span>
          </span>
        </el-tree>
      </el-col>
    </el-row>
    <BridgeComponentForm ref="bridgeComponentForm" @addRow="saveBridgeComponentInstance(arguments)" />
    <BridgeComponentMultipleAddForm ref="BridgeComponentMultipleAddForm" @addRow="saveBridgeComponentMultipleInstance(arguments)" />
  </div>
</template>

<script>
import SelectTree from '@/components/treeSelect/treeSelect';
import BridgeComponentForm from './BridgeComponentForm';
import BridgeComponentMultipleAddForm from './BridgeComponentMultipleAddForm';
import _ from 'lodash';

export default {
  name: 'BridgeManagement',
  data() {
    return {
      loading: false,
      bridgeId: '',
      compId: '',
      inputForm: {
        compCode: '',
        compName: '',
      },
      bridgeList: [],
      compTreeData: [],
    };
  },
  components: {
    SelectTree,
    BridgeComponentMultipleAddForm,
    BridgeComponentForm,
  },
  methods: {
    fetchBridgeLocationTreeData() {
      this.loading = true;
      this.$http({
        url: `/bridge/bridge/treeData`,
        method: 'get',
        params: {
          status: 1
        }
      }).then(({ data }) => {
        this.loading = false;
        if (Array.isArray(data.bridgeList)) {
          this.bridgeList = specifyBridgeInfo(data.bridgeList);
        }
      });
    },
    fetchCompTreeData() {
      if (!this.bridgeId) {
        return;
      }
      this.loading = true;
      this.$http({
        url: `/bridge/bridgeBranch/treeComponentDataByBridgeBranchId`,
        method: 'get',
        params: {
          id: this.bridgeId,
          compCode: this.inputForm.compCode,
          compName: this.inputForm.compName,
        }
      }).then(({ data }) => {
        this.loading = false;
        this.compTreeData = specifyCompInfo(data.treeData);
      });
    },
    fetchCompInstanceList() {
      this.$http({
        url: `/bridge/bridgeComponent/list`,
        method: 'get',
        params: {
          'branch.id' : this.bridgeId,
          'comp.id' : this.compId,
          code: this.inputForm.compCode,
          name: this.inputForm.compName,
        }
      }).then(({ data }) => {
        if (Array.isArray(data.page.list) && data.page.list.length > 0) {
          const instanceList = data.page.list.map((item) => ({
            ...item,
            isInstance: true,
          }));
          this.$refs.compTreeDataRef.updateKeyChildren(this.compId, instanceList);
        }
      });
    },
    fetchInstanceList() {
      this.$http({
        url: `bridge/bridgeComponent/queryById?id=${this.compId}`,
        method: 'get',
      }).then(({ data }) => {
        if (data.bridgeComponent && !_.isEmpty(data.bridgeComponent)) {
          const instanceList = [
            {
              id: this.compId + '-location',
              name: `位置：${data.bridgeComponent.location?.location}`,
              isInstanceInfo: true,
            },
            {
              id: this.compId + '-编码',
              name: `编码：${data.bridgeComponent.code}`,
              isInstanceInfo: true,
              isCode: true,
            },
          ];
          this.$refs.compTreeDataRef.updateKeyChildren(this.compId, instanceList);
        }
      });
    },
    onFilterSubmit() {
      if (this.bridgeId) {
        this.fetchCompTreeData();
      }
    },
    resetFilterForm() {
      this.inputForm = {
        compCode: '',
        compName: '',
      }
      this.$refs.inputForm.resetFields()
      this.onFilterSubmit()
    },
    handleBridgeClick(data) {
      // 桥梁或者桥梁分支都可以点击
      if (!data._handledByFront_) {
        this.compTreeData = []
      }
      if (data._handledByFront_ || data.bridgeBranchList?.length == 0) {
        this.bridgeId = data.id;
        this.fetchCompTreeData();
      }
    },
    handleCompClick(data) {
      // if (this.compId === data.id) {
      //   return
      // }
      if (data.isLeaf) {
        this.compId = data.id;
        this.fetchCompInstanceList();
      } else if (data.isInstance) {
        this.compId = data.id;
        this.fetchInstanceList();
      }
    },
    addNewComp(data) {
      console.log('addNewComp', data);
      this.$refs.bridgeComponentForm.init('add');
    },
    editInstance(data) {
      console.log('editInstance', data);
      this.$refs.bridgeComponentForm.init('edit', data);
    },
    deleteInstance(data) {
      if (!data.id) {
        return;
      }
      this.$confirm(`确定删除这个构件实例吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true;
        this.$http({
          url: `/bridge/bridgeComponent/delete?id=${data.id}`,
          method: 'delete',
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg);
            this.fetchCompInstanceList();
            this.fetchCompTreeData();
          }
          this.loading = false;
        });
      });
    },
    addMultipleComp(data) {
      this.$refs.BridgeComponentMultipleAddForm.init('add');
    },
    saveBridgeComponentInstance(child) {
      console.log('child', child[1]);
      const params = Object.assign(
        {},
        {
          branch: {
            id: this.bridgeId,
          },
          comp: {
            id: this.compId,
          },
        },
        child[1],
      );
      this.loading = true;
      this.$http({
        url: '/bridge/bridgeComponent/save',
        method: 'post',
        data: params,
      }).then(({ data }) => {
        this.loading = false;
        this.fetchCompInstanceList();
        this.fetchInstanceList();
        this.fetchCompTreeData();
      });
    },
    saveBridgeComponentMultipleInstance(child) {
      console.log('child', child[1]);
      const params = Object.assign({}, child[1], {
        branch: {
          id: this.bridgeId,
        },
        comp: {
          id: this.compId,
        },
      });
      this.loading = true;
      this.$http({
        url: '/bridge/bridgeComponent/addBatch',
        method: 'post',
        data: params,
      }).then(({ data }) => {
        this.loading = false;
        this.fetchCompInstanceList();
        this.fetchInstanceList();
        this.fetchCompTreeData();
      });
    },
  },
  mounted() {
    this.fetchBridgeLocationTreeData();
  },
};

export function specifyBridgeInfo(list) {
  return list.map((item) => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      return {
        ...item,
        children: specifyBridgeInfo(item.children),
      };
    } else if (Array.isArray(item.bridgeList) && item.bridgeList.length > 0) {
      return {
        ...item,
        children: item.bridgeList.map((obj) => ({
          ...obj,
          children: Array.isArray(obj.bridgeBranchList)
            ? obj.bridgeBranchList.map((obj2) => ({
                ...obj2,
                _handledByFront_: true,
              }))
            : [],
        })),
      };
    } else {
      return item;
    }
  });
}

export function specifyCompInfo(list) {
  return list.map((item) => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      return {
        ...item,
        children: specifyCompInfo(item.children),
      };
    } else {
      return {
        ...item,
        isLeaf: true, //  没有子节点的节点才可以添加构件实例
      };
    }
  });
}
</script>

<style scoped>
</style>
