<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="4">
        <el-button type="primary" size="small" @click="() => createTopLevelNode()" style="margin-bottom: 10px"> 添加一级节点</el-button>
        <el-input
          placeholder="输入关键字进行过滤"
          size="small"
          v-model="filterText">
        </el-input>
        <el-tree
          class="filter-tree"
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
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
          ref="compTreeRef"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
            <span>
              <el-button type="text" class="tree-item-button" icon="el-icon-plus"
                         @click="() => editTreeNode(data)"> </el-button>
              <el-button type="text" class="tree-item-button" icon="el-icon-edit-outline"
                         @click="() => editTreeNode(data, true)"> </el-button>
              <el-button type="text" class="tree-item-button" icon="el-icon-delete"
                         @click="() => delTreeNode(data)"> </el-button>
            </span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="20">
        <el-row :gutter="15">
          <el-button type="primary" size="small" @click="setBridgeCategory()">
            设置桥梁类型
          </el-button>
          <el-button-group class="pull-right">
            <el-tooltip class="item" effect="dark" content="搜索" placement="top">
              <!--              <el-button
                              type="default"
                              size="small"
                              icon="el-icon-search"
                              @click="isSearchCollapse = !isSearchCollapse, isImportCollapse=false">
                            </el-button>-->
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="刷新" placement="top">
              <el-button type="default" size="small" icon="el-icon-refresh" @click="fetchCompListData"></el-button>
            </el-tooltip>
          </el-button-group>
        </el-row>
        <el-table :data="dataList" border size="medium" v-loading="loading" @selection-change="selectionChangeHandle"
                  class="table">
          <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
          <el-table-column prop="code" show-overflow-tooltip label="类型编码"></el-table-column>
          <el-table-column prop="name" show-overflow-tooltip label="类型名称"></el-table-column>
          <el-table-column prop="parentFullNames" label="上级类型"></el-table-column>
          <el-table-column prop="bridgeTypeNames" label="对应桥梁类型"></el-table-column>
          <el-table-column prop="sort" label="显示顺序"></el-table-column>
          <el-table-column prop="createBy.name" label="创建人"></el-table-column>
          <el-table-column prop="createDate" label="创建日期"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-dialog
      :title="isEditing ? '修改构件库' : '新增构件库'"
      :close-on-click-modal="false"
      v-dialogDrag
      :visible.sync="compEditDialogVisible">
      <div style="overflow: hidden">
        <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="140px">
          <el-row :gutter="15">
            <el-col :span="12">
              <el-row :gutter="15">
                <el-col>
                  <el-form-item label="上级类型" prop="parentId"
                                :rules="[{ required: true, message: '上级类型不能为空', trigger: 'blur' }]">
                    <SelectTree
                      ref="parent"
                      :props="{
                          value: 'id',             // ID字段名
                          label: 'name',         // 显示名称
                          children: 'children'    // 子级字段名
                        }"
                      :data="inputForm.parentId === '0' ? onlyRootData : compTreeData"
                      :value="inputForm.parentId"
                      :disabled="inputForm.parentId === '0'"
                      :clearable="true"
                      :accordion="true"
                      @getValue="(value) => {inputForm.parentId=value}"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="15">
                <el-col :span="24">
                  <el-form-item label="类型编码" prop="code"
                                :rules="[{ required: true, message: '类型编码不能为空', trigger: 'blur' }]">
                    <el-input v-model="inputForm.code" placeholder="请填写类型编码" maxlength="50" minlength="1"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="15">
                <el-col :span="24">
                  <el-form-item label="类型名称" prop="name"
                                :rules="[{ required: true, message: '类型名称不能为空', trigger: 'blur' }]">
                    <el-input v-model="inputForm.name" placeholder="请填写类型名称" maxlength="50" minlength="1"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="15">
                <el-col :span="24">
                  <el-form-item label="显示顺序" prop="sort"
                                :rules="[{ required: true, message: '显示顺序不能为空', trigger: 'blur' }]">
                    <el-input v-model="inputForm.sort" placeholder="请填写显示顺序" maxlength="10" minlength="1"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="15">
                <el-col :span="24">
                  <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" v-model="inputForm.remark" maxlength="200" minlength="1"
                              rows="5"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="12">
              <el-form-item label="桥梁类型" prop="bridgeTypeIds">
                <el-checkbox-group v-if="isEditing && compEditDialogVisible" style="width:100%"
                                   v-model="inputForm.bridgeTypeIds" placement="column">
                  <el-checkbox v-if="compEditDialogVisible" style="width:100%" v-for="(item, index) in bridgeCategoryList"
                               :key="index" :label="item.bridgeTypeId">{{ item.bridgeTypeName }}
                  </el-checkbox>
                </el-checkbox-group>

                <el-checkbox-group v-if="!isEditing && bridgeCategoryList2" style="width:100%"
                                   v-model="inputForm.bridgeTypeIds" placement="column">
                  <el-checkbox style="width:100%" v-for="(item, index) in bridgeCategoryList2"
                               :key="index" :label="item.id">{{ item.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button @click="compEditDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="doSubmit()" :loading="compEditLoading">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="设置桥梁类型"
      :close-on-click-modal="false"
      v-dialogDrag
      :visible.sync="compBridgeTypeDialogVisible">
      <el-form :model="inputForm" ref="inputForm" v-loading="loading" label-width="120px">
        <el-col :span="12">
          <el-form-item label="桥梁类型" prop="bridgeTypeIds">
            <el-checkbox-group v-if="compBridgeTypeDialogVisible" style="width:100%" v-model="inputForm.bridgeTypeIds"
                               placement="column">
              <el-checkbox v-if="compBridgeTypeDialogVisible" style="width:100%"
                           v-for="(item, index) in bridgeCategoryList"
                           :key="index" :label="item.bridgeTypeId">{{ item.bridgeTypeName }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="compBridgeTypeDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="doBridgeTypeSubmit()" v-noMoreClick>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SelectTree from '@/components/treeSelect/treeSelect.vue';

export default {
  data() {
    return {
      loading: false,
      compEditLoading: false,
      compEditDialogVisible: false,
      compBridgeTypeDialogVisible: false,
      selectedCompKey: null,
      inputForm: {
        id: '',
        parentId: '',
        name: '',
        sort: '',
        code: '',
        remark: '',
        bridgeTypeIds: []
      },
      filterText: '',
      isEditing: false,
      compTreeData: [], // 构件库树数据
      onlyRootData: [{id: '0', name: '根节点'}],
      dataList: [], // 构件库列表数据
      bridgeCategoryList: [], // 桥梁类型列表
      bridgeCategoryList2: [],
      dataListSelections: [] // 构件库列表选中
    }
  },
  components: {
    SelectTree,
  },
  methods: {
    fetchCompTreeData() {
      this.$http({
        url: `/basecomponent/baseComponent/treeData`,
        method: 'get',
      }).then(({data}) => {
        if (Array.isArray(data.treeData)) {
          this.compTreeData = data.treeData;
          this.formCompTreeData = [
            {
              id: '0',
              name: '根节点',
              children: data.treeData,
            },
          ];
          if (data.treeData.length > 0) {
            setTimeout(() => {
              const selectedCompKey = this.selectedCompKey || data.treeData[0].id;
              this.$refs.compTreeRef.setCurrentKey(selectedCompKey);
              this.selectedCompKey = selectedCompKey;
              this.fetchCompListData();
            }, 200);
          }
        }
      });
    },
    fetchCompListData() {
      if (!this.selectedCompKey) {
        return;
      }
      this.loading = true;
      this.$http({
        url: `/basecomponent/baseComponent/getLeafNodeList?selectedId=${this.selectedCompKey}`,
        method: 'get',
      }).then(({data}) => {
        this.loading = false;
        if (Array.isArray(data.list)) {
          this.dataList = data.list;
        }
      });
    },
    handleNodeClick(data) {
      this.selectedCompKey = data.id;
      this.fetchCompListData();
    },
    // 构件库树数据不返回桥梁类型，编辑构件库树时，去构件库列表里寻找桥梁类型数据
    /*    findBridgeInfo(list) {
      const current = list.find(item => item.id === this.inputForm.id)
      if (current) {
        // const bridgeId = current
      }
    }, */
    // 创建一级节点
    createTopLevelNode() {
      const data = {
        id: '0',
      };
      this.editTreeNode(data);
    },
    // 修改构件库
    editTreeNode(data, isEditing) {
      this.isEditing = isEditing
      this.compEditDialogVisible = true
      if (isEditing) {
        this.$http({
          url: `/basecomponent/baseComponent/queryById?id=${data.id}`,
          method: 'get',
        }).then(({data}) => {
          if (data.baseComponent) {
            const inputForm = {
              id: data.baseComponent.id,
              parentId: data.baseComponent.parentId,
              name: data.baseComponent.name,
              sort: data.baseComponent.sort,
              code: data.baseComponent.code,
              remark: data.baseComponent.remark
            }
            this.bridgeCategoryList = data.baseComponent.bridgeTypeRelatedInfoList
            if (Array.isArray(data.baseComponent.bridgeTypeRelatedInfoList)) {
              inputForm.bridgeTypeIds = data.baseComponent.bridgeTypeRelatedInfoList.filter(item => item.selected).map(item => item.bridgeTypeId)
            } else {
              inputForm.bridgeTypeIds = []
            }
            this.$nextTick(() => {
              this.inputForm = inputForm;
            })
          }
        });
      } else {
        this.$nextTick(() => {
          this.inputForm = {
            parentId: data.id,
            bridgeTypeIds: []
          }
        })
      }
    },
    // 删除节点
    async delTreeNode(data) {
      if (this.loading) {
        return
      }
      const preResult = await this.$http({
        url: '/basecomponent/baseComponent/preDelete',
        method: 'get',
        params: {
          id: data.id
        }
      })
      // 如果success为false 则说明强制校验不通过，弹出强提示
      if (!preResult.data.success) {
        this.$alert(preResult.data.msg, '提示', {
          confirmButtonText: '确定',
        });
        return
      }
      let msg = preResult.data.msg.length > 6 ? preResult.data.msg : '确定要删除此构件类型吗？'
      await this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      this.$http({
        url: `/basecomponent/baseComponent/delete?id=${data.id}`,
        method: 'delete',
      }).then(({data}) => {
        this.loading = false;
        this.fetchCompTreeData();
      });
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增 修改节点接口函数
    doSubmit() {
      const self = this
      this.$refs['inputForm'].validate((valid) => {
        if (!valid) {
          return
        }
        if (this.compEditLoading) {
          return
        }
        this.compEditLoading = true
        const params = {
          parent: {
            id: this.inputForm.parentId,
          },
          bridgeTypeIds: this.inputForm.bridgeTypeIds.join(','),
          name: this.inputForm.name,
          code: this.inputForm.code,
          sort: this.inputForm.sort,
          remark: this.inputForm.remark
        }
        if (this.isEditing) {
          params.id = this.inputForm.id
        }

        this.$http({
          url: `/basecomponent/baseComponent/save`,
          method: 'post',
          data: params,
        }).then(({data}) => {
          this.compEditLoading = false
          if (data.success) {
            this.compEditDialogVisible = false;
            this.fetchCompTreeData();
          }
        }).catch(() => {
          this.compEditLoading = false
        })
      })
    },
    // 设置桥梁类型
    doBridgeTypeSubmit() {
      if (!Array.isArray(this.inputForm.bridgeTypeIds) || this.inputForm.bridgeTypeIds.length === 0) {
        this.$message.warning('请至少选择一个节点')
        return
      }
      const params = {
        id: this.dataListSelections[0].id,
        bridgeTypeIds: this.inputForm.bridgeTypeIds.join(',')
      }
      this.$http({
        url: `/basecomponent/baseComponent/saveCompBridgeType`,
        method: 'post',
        data: params,
      }).then(({data}) => {
        if (data.success) {
          this.compBridgeTypeDialogVisible = false
          this.$message.success('设置成功！')
          this.fetchCompListData()
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    // 获取桥梁类型接口  页面初始化时获取一次即可
    fetchBridgeCategoryList() {
      let that = this
      that.$http({
        url: `/baseinfo/basetype/baseType/treeDataByCode?code=101`,
        method: 'get'
      }).then(({data}) => {
        that.inputForm = {
          bridgeTypeIds: []
        }
        if (Array.isArray(data.treeData)) {
          that.bridgeCategoryList = []
          that.bridgeCategoryList2 = data.treeData[0].children
        }
      });
    },
    // 设置桥梁类型
    setBridgeCategory() {
      if (!Array.isArray(this.dataListSelections) || this.dataListSelections.length === 0) {
        this.$message.warning('请至少选择一个节点');
        return;
      }
      this.compBridgeTypeDialogVisible = true
      this.inputForm = {
        bridgeTypeIds: []
      }
      this.$http({
        url: `/basecomponent/baseComponent/queryById?id=${this.dataListSelections[0].id}`,
        method: 'get'
      }).then(({data}) => {
        if (data.baseComponent) {
          const inputForm = {
            id: data.baseComponent.id,
            parentId: data.baseComponent.parentId,
            name: data.baseComponent.name,
            sort: data.baseComponent.sort,
            code: data.baseComponent.code,
            remark: data.baseComponent.remark
          }
          this.bridgeCategoryList = data.baseComponent.bridgeTypeRelatedInfoList
          if (Array.isArray(data.baseComponent.bridgeTypeRelatedInfoList)) {
            inputForm.bridgeTypeIds = data.baseComponent.bridgeTypeRelatedInfoList.filter(item => item.selected).map(item => item.bridgeTypeId)
          } else {
            inputForm.bridgeTypeIds = []
          }
          this.inputForm = inputForm
        }
      })
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
  },
  mounted() {
    this.inputForm = {
      bridgeTypeIds: []
    }
    this.fetchCompTreeData()
    this.fetchBridgeCategoryList()
  },
  watch: {
    filterText (val) {
      this.$refs.compTreeRef.filter(val)
    }
  },
}
</script>

<style scoped>
</style>
