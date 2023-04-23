<template>
  <div>
    <el-dialog :title="title" :close-on-click-modal="false" width="80%" :visible.sync="visible" @close="close">
      <div v-loading="loading">
        <el-form :model="inputForm" ref="inputForm" label-width="160px">
          <el-row :gutter="15">
            <el-col :span="8">
              <el-form-item
                label="桥梁编码"
                prop="code"
                :rules="[
                { required: true, message: '桥梁编码不能为空', trigger: 'blur' },
                { min: 1, message: '最小长度是1个字符', trigger: 'blur' },
              ]"
              >
                <el-input v-model="inputForm.code" placeholder="请输入" maxlength="10" minlength="1"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                label="桥梁名称"
                prop="name"
                :rules="[
                { required: true, message: '桥梁名称不能为空', trigger: 'blur' },
                { min: 1, message: '最小长度是1个字符', trigger: 'blur' },
              ]"
              >
                <el-input v-model="inputForm.name" placeholder="请输入" maxlength="15" minlength="1"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="结构类型" prop="baseTypeId"
                            :rules="[{ required: true, message: '结构类型不能为空', trigger: 'blur' }]">
                <el-select v-model="inputForm.baseTypeId" placeholder="请选择结构类型" @change="handleTypeChange"
                           :disabled="!!inputForm.id" style="width: 100%">
                  <el-option
                    v-for="item in dict.structureTree"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
                <!--              <SelectTree-->
                <!--                :props="{-->
                <!--                  value: 'id', // ID字段名-->
                <!--                  label: 'name', // 显示名称-->
                <!--                  children: 'children', // 子级字段名-->
                <!--                }"-->
                <!--                :data="dict.structureTree"-->
                <!--                :value="inputForm.baseTypeId"-->
                <!--                :clearable="false"-->
                <!--                :accordion="true"-->
                <!--                :disabled="!!inputForm.id"-->
                <!--                @getValue="-->
                <!--                  (value) => handleTypeChange(value)-->
                <!--                "-->
                <!--              />-->
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="归属区域" prop="positionName.id"
                            :rules="[{ required: true, message: '归属区域不能为空', trigger: 'blur' }]">
                <!-- <SelectTree
                  :props="{
                            value: 'id',             // ID字段名
                            label: 'name',         // 显示名称
                            children: 'children'    // 子级字段名
                          }"
                  :data="areaList"
                  :value="inputForm.positionName.id"
                  :clearable="false"
                  :accordion="true"
                  @getValue="(value) => {inputForm.positionName.id=value}"/> -->
                <el-cascader
                  v-if="!positionLoading"
                  style="width: 100%"
                  ref="cascader"
                  :props="{
                  value: 'id',
                  label: 'name',
                  children: 'children',
                  expandTrigger: 'hover',
                }"
                  v-model="inputForm.positionName.id"
                  :options="areaList"
                  filterable
                ></el-cascader>
                <i class="el-icon-loading" v-else></i>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="养护类型" prop="maintainTypeId"
                            :rules="[{ required: true, message: '养护类型不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.curingTree"
                  :value="inputForm.maintainTypeId"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.maintainTypeId = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="养护等级" prop="maintainLevelId"
                            :rules="[{ required: true, message: '养护等级不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.curingLevelTree"
                  :value="inputForm.maintainLevelId"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.maintainLevelId = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="道路名称" prop="roadName"
                            :rules="[{ required: true, message: '道路名称不能为空', trigger: 'blur' }]">
                <el-input v-model="inputForm.roadName" placeholder="请输入" maxlength="50" minlength="1"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="道路等级" prop="roadLevelId"
                            :rules="[{ required: true, message: '道路等级不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.roadLevelTree"
                  :value="inputForm.roadLevelId"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.roadLevelId = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="管理单位" prop="manageOrg.id"
                            :rules="[{ required: true, message: '管理单位不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.manageList"
                  :value="inputForm.manageOrg.id"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.manageOrg.id = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="养护单位" prop="maintainOrg.id"
                            :rules="[{ required: true, message: '养护单位不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.curingList"
                  :value="inputForm.maintainOrg.id"
                  :clearable="false"
                  :accordion="true"
                  @getValue="(value) => {
                  inputForm.maintainOrg.id = value
                }"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="建设单位" prop="buildOrg.id"
                            :rules="[{ required: true, message: '建设单位不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.buildList"
                  :value="inputForm.buildOrg.id"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.buildOrg.id = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设计单位" prop="designOrg.id"
                            :rules="[{ required: true, message: '设计单位不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.designList"
                  :value="inputForm.designOrg.id"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.designOrg.id = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="监理单位" prop="supervisorOrg.id"
                            :rules="[{ required: true, message: '监理单位不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.supervisorList"
                  :value="inputForm.supervisorOrg.id"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.supervisorOrg.id = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="施工单位" prop="constructOrg.id"
                            :rules="[{ required: true, message: '施工单位不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.constructionList"
                  :value="inputForm.constructOrg.id"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.constructOrg.id = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="建成时间" prop="tuiltDate"
                            :rules="[{ required: true, message: '建成时间不能为空', trigger: 'blur' }]">
                <el-date-picker v-model="inputForm.tuiltDate" type="date" value-format="yyyy-MM-dd hh:mm:ss"
                                placeholder="选择日期" style="width: 100%"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="总造价（万元）" prop="totalCost">
                <el-input type="number" v-model="inputForm.totalCost" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="跨跃位置" prop="stepOver">
                <el-input v-model="inputForm.stepOver" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="设计荷载" prop="designLoadId"
                            :rules="[{ required: true, message: '设计荷载不能为空', trigger: 'blur' }]">
                <SelectTree
                  :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                  :data="dict.designloadTree"
                  :value="inputForm.designLoadId"
                  :clearable="false"
                  :accordion="true"
                  @getValue="
                  (value) => {
                    inputForm.designLoadId = value;
                  }
                "
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="限载标准（t）" prop="loadLimit">
                <el-input type="number" v-model="inputForm.loadLimit" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="限高（m）" prop="heightLimit">
                <el-input type="number" v-model="inputForm.heightLimit" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="桥梁跨数（跨）" prop="bridgeSpan"
                            :rules="[{ required: true, message: '桥梁跨数不能为空', trigger: 'blur' }]">
                <el-input type="number" v-model="inputForm.bridgeSpan" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="桥面面积（m²）" prop="bridgeArea">
                <el-input type="number" v-model="inputForm.bridgeArea" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="桥梁总长（m）" prop="bridgeLong"
                            :rules="[{ required: true, message: '桥梁总长（m）不能为空', trigger: 'blur' }]">
                <el-input type="number" v-model="inputForm.bridgeLong" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="inputForm.remark" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-tabs v-model="activeName">
          <el-tab-pane label="主辅桥" name="tab1" v-if="inputForm.baseTypeId === enableSubbridgeTypeId">
            <el-button type="primary" size="small" @click="addNewSubBridge()" icon="el-icon-plus"> 新增</el-button>
            <SubBridgeList :bridgeBranchList="bridgeBranchList" :loading="loading"
                           @handleSelectionChange="handleSubBridgeSelectionChange" @editSubBridge="editSubBridge"
                           @delSubBridge="delSubBridge"/>
            <el-dialog title="新增主辅桥" :close-on-click-modal="false" :visible.sync="subBridgeVisible" append-to-body>
              <el-form :model="subBridgeForm" ref="subBridgeForm" label-width="120px">
                <el-row :gutter="15">
                  <el-col :span="16">
                    <el-form-item label="主辅桥编码" prop="code"
                                  :rules="[{ required: true, message: '主辅桥编码不能为空', trigger: 'blur' }]">
                      <el-input v-model="subBridgeForm.code" placeholder="请输入" maxlength="10" minlength="1"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="16">
                    <el-form-item
                      label="主辅桥名称"
                      prop="name"
                      :rules="[
                      { required: true, message: '主辅桥名称不能为空', trigger: 'blur' },
                      { min: 1, message: '最小长度是1个字符', trigger: 'blur' },
                    ]"
                    >
                      <el-input v-model="subBridgeForm.name" placeholder="请输入" maxlength="15" minlength="1"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="16">
                    <el-form-item label="结构类型" prop="bridgeType.id"
                                  :rules="[{ required: true, message: '结构类型不能为空', trigger: 'blur' }]">
                      <SelectTree
                        :props="{
                        value: 'id', // ID字段名
                        label: 'name', // 显示名称
                        children: 'children', // 子级字段名
                      }"
                        :data="dict.structureTree.filter((item) => item.id !== enableSubbridgeTypeId)"
                        :value="subBridgeForm.bridgeType.id"
                        :clearable="false"
                        :accordion="true"
                        :disabled="!!subBridgeForm.id"
                        @getValue="
                        (value, label) => {
                          subBridgeForm.bridgeType.id = value;
                          subBridgeForm.bridgeType.name = label;
                        }
                      "
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <span slot="footer" class="dialog-footer">
              <el-button @click="subBridgeVisible = false">关闭</el-button>
              <el-button type="primary" @click="submitSubBridge()">保存</el-button>
            </span>
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="图片" name="tab2">
            <div class="image-wrapper" v-if="visible">
              <BridgeImageGroup :max="6" :imageList="bridgePicturesList" @handleRemove="handleImageRemove"
                                @handleFileSuccess="handleImageUploadSuccess"/>
            </div>
          </el-tab-pane>
          <el-tab-pane label="档案" name="tab3">
            <el-button type="primary" size="small" @click="addNewFile()" icon="el-icon-plus"> 新增</el-button>
            <el-button type="danger" size="small" @click="deleteFile()" icon="el-icon-delete"> 删除</el-button>
            <BridgeFileComponent :fileList="bridgeFilesList" :loading="loading"
                                 @handleSelectionChange="handleFileSelectionChange"/>
            <BridgeFileUploadDialog ref="bridgeFileUploadDialog" @submitFileUpload="handleFileUploadSubmit"
                                    :classificationTree="dict.classificationTree"/>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="doSubmit()" :loading="loading">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SubBridgeList from './SubBridgeList'
import BridgeImageGroup from './BridgeImageGroup'
import BridgeFileComponent from './BridgeFileComponent'
import BridgeFileUploadDialog from './BridgeFileUploadDialog'
import SelectTree from '@/components/treeSelect/treeSelect.vue'

const EnableSubbridgeTypeId = 'dd5db36c86c948f29986e09f3d79f38c' // 有主辅桥的桥梁类型
const getdefaultSubBridgeForm = () => ({
  code: '',
  name: '',
  bridgeType: {
    id: ''
  }
})
const defaultInputForm = () => ({
  id: '',
  code: '',
  name: '',
  positionName: {
    id: ''
  },
  baseTypeId: '',
  maintainTypeId: '',
  maintainLevelId: '',
  roadName: '',
  roadLevelId: '',
  manageOrg: {
    id: ''
  },
  maintainOrg: {
    id: ''
  },
  constructOrg: {
    id: ''
  },
  designOrg: {
    id: ''
  },
  supervisorOrg: {
    id: ''
  },
  buildOrg: {
    id: ''
  },
  tuiltDate: '',
  totalCost: '',
  designLoadId: '',
  stepOver: '',
  loadLimit: '',
  heightLimit: '',
  bridgeSpan: '',
  bridgeArea: '',
  bridgeLong: '',
  remark: ''
})
export default {
  name: 'BridgeEditDialog',
  props: {
    dict: Object,
    areaList: Array,
    positionLoading: Boolean
  },
  data() {
    return {
      title: '新增桥梁',
      visible: false,
      subBridgeVisible: false,
      editingSubbridgeIndex: -1, // 正在编辑的主辅桥index  -1 为在新增
      fileDialogVisible: false,
      loading: false,
      activeName: 'tab2',
      enableSubbridgeTypeId: EnableSubbridgeTypeId,
      inputForm: defaultInputForm(),
      subBridgeForm: getdefaultSubBridgeForm(),
      fileForm: {
        fileTypeId: '',
        fileName: '',
        alias: ''
      },
      baseTypeId: '', // 当前的桥梁类型
      bridgeBranchList: [],
      bridgePicturesList: [],
      bridgeFilesList: []
    }
  },
  components: {
    SelectTree,
    SubBridgeList,
    BridgeFileComponent,
    BridgeFileUploadDialog,
    BridgeImageGroup
  },
  mounted() {
    this.subBridgeSelection = []
    this.fileSelection = []
  },
  methods: {
    async init(method, id) {
      if (method === 'edit') {
        this.title = '修改桥梁'
        const _params = await this.fetchDetail(id)
        if (!_params) {
          return
        }
        this.bridgePicturesList = _params.bridgePicturesList
        this.bridgeBranchList = _params.bridgeBranchList
        this.bridgeFilesList = _params.bridgeFilesList.map(image => ({
          ...image,
          url: image.url,
          name: image.name
        }))
        delete _params.bridgePicturesList
        delete _params.bridgeBranchList
        delete _params.bridgeFilesList
        this.activeName = _params.baseTypeId === EnableSubbridgeTypeId ? 'tab1' : 'tab2'
        this.visible = true
        this.$nextTick(() => {
          this.inputForm = _params
        })
      } else {
        this.title = '新建桥梁'
        if (this.$refs.inputForm) {
          this.$refs.inputForm.resetFields()
        }
        this.baseTypeId = ''
        this.bridgeBranchList = []
        this.bridgePicturesList = []
        this.bridgeFilesList = []
        this.visible = true
        this.$nextTick(() => {
          this.inputForm = defaultInputForm()
        })
      }
    },
    async fetchDetail(id) {
      if (!id) {
        return
      }
      this.loading = true
      return this.$http({
        url: `/bridge/bridge/queryById?id=${id}`,
        method: 'get'
      }).then(({data}) => {
        this.loading = false
        if (data.success) {
          return data.bridge
        } else {
          return ''
        }
      }).catch(e => {
        return ''
      })
    },
    addNewSubBridge() {
      this.subBridgeVisible = true
      this.editingSubbridgeIndex = -1
      this.$nextTick(() => {
        this.subBridgeForm = getdefaultSubBridgeForm()
      })
    },
    editSubBridge(val) {
      console.log('editSubBridge val', val)
      this.subBridgeVisible = true
      this.editingSubbridgeIndex = this.bridgeBranchList.findIndex(item => item.name === val.name)
      this.$nextTick(() => {
        this.subBridgeForm = {
          ...val
        }
      })
    },
    delSubBridge(val) {
      const self = this
      if (val.id && self.bridgeBranchList.filter(item => item.id).length === 1) {
        self.$message.error('至少要保留一个主辅桥')
        return
      }
      self.$confirm('确认要删除该主辅桥吗？', '提示', {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const index = self.bridgeBranchList.findIndex(item => item.name === val.name)
        if (index === -1) {
          return
        }
        if (!val.id) {
          // 新增的桥，没有id，前端删除即可
          self.bridgeBranchList.splice(index, 1)
        } else {
          const result = await self.$http({
            url: '/bridge/bridgeBranch/preDeleteCheck?id=' + val.id,
            method: 'get'
          })
          if (!result.data.success) {
            self.$alert(result.data.msg, '提示', {
              confirmButtonText: '确定'
            })
            return
          }
          const resultRes = await self.$http({
            url: '/bridge/bridgeBranch/delete?id=' + val.id,
            method: 'delete'
          })
          if (resultRes.data.success) {
            self.$message.success('删除成功！')
            self.bridgeBranchList.splice(index, 1)
          }
        }
      })
    },
    submitSubBridge() {
      const self = this
      this.$refs['subBridgeForm'].validate((valid) => {
        if (valid) {
          const MaxCount = self.editingSubbridgeIndex !== -1 ? 2 : 1
          if (self.bridgeBranchList.filter(item => item.code === self.subBridgeForm.code).length >= MaxCount) {
            self.$message.warning('有重复的主辅桥编码，请修改')
            return
          }
          if (self.bridgeBranchList.filter(item => item.name === self.subBridgeForm.name).length >= MaxCount) {
            self.$message.warning('有重复的主辅桥名称，请修改')
            return
          }
          self.subBridgeVisible = false
          if (self.editingSubbridgeIndex !== -1) {
            // 修改
            self.bridgeBranchList.splice(self.editingSubbridgeIndex, 1, self.subBridgeForm)
          } else {
            // 新增
            self.bridgeBranchList.push({...self.subBridgeForm})
          }
          self.subBridgeForm = getdefaultSubBridgeForm()
        }
      })
    },
    async handleTypeChange(value) {
      console.log('handleTypeChange', value)
      const self = this
      if (value === EnableSubbridgeTypeId) {
        this.inputForm.baseTypeId = value
        this.baseTypeId = value
        self.activeName = 'tab1'
      } else if (this.baseTypeId === EnableSubbridgeTypeId && this.bridgeBranchList.length > 0) {
        this.$confirm(`结构类型变更，将清除主辅导桥信息，是否继续操作？`, '提示', {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          self.inputForm.baseTypeId = value
          self.baseTypeId = value
          self.bridgeBranchList = []
          self.activeName = 'tab2'
        }).catch(() => {
          self.inputForm.baseTypeId = EnableSubbridgeTypeId
          self.baseTypeId = EnableSubbridgeTypeId
          self.activeName = 'tab1'
        })
      } else {
        this.inputForm.baseTypeId = value
        this.baseTypeId = value
        self.activeName = 'tab2'
      }
    },
    async preSaveCheck() {
      let positionNameId = ''
      if (Array.isArray(this.inputForm.positionName.id) && this.inputForm.positionName.id.length === 3) {
        positionNameId = this.inputForm.positionName.id[2]
      }
      if (typeof this.inputForm.positionName.id === 'string') {
        positionNameId = this.inputForm.positionName.id
      }
      const params = {
        // 'maintainOrg.id': this.inputForm.baseTypeId
        code: this.inputForm.code,
        name: this.inputForm.name,
        positionName: {
          id: positionNameId
        }
      }
      if (this.inputForm.id) {
        params.id = this.inputForm.id
        params['maintainOrg.id'] = this.inputForm.baseTypeId
      }
      const result = await this.$http({
        url: '/bridge/bridge/preSaveCheck',
        method: 'POST',
        data: params
      })
      if (!result.data.success) {
        this.$alert(result.data.msg, '提示', {
          confirmButtonText: '确定'
        })
        return Promise.reject(new Error('error'))
      } else if (result.data.msg.length > 6){
        return this.$confirm(result.data.msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } else {
        return Promise.resolve('')
      }
    },

    handleSubBridgeSelectionChange(val) {
      console.log('val', val)
      this.subBridgeSelection = val
    },
    handleImageRemove({fileList}) {
      this.bridgePicturesList = fileList
    },
    handleImageUploadSuccess({fileList}) {
      this.bridgePicturesList = fileList
    },
    addNewFile() {
      this.$refs['bridgeFileUploadDialog'].init()
    },
    deleteFile() {
      const idList = this.fileSelection.map((item) => item.id)
      this.bridgeFilesList = this.bridgeFilesList.filter((item) => !idList.includes(item.id))
    },
    submitFile() {
      this.$refs['fileForm'].validate((valid) => {
        if (valid) {
          this.fileDialogVisible = false
          this.bridgeFilesList.push({...this.fileForm})
          this.fileForm = {}
        }
      })
    },
    handleFileSelectionChange(fileSelection) {
      console.log('handleFileSelectionChange', fileSelection)
      this.fileSelection = fileSelection
    },
    handleFileUploadSubmit(params) {
      const {fileList} = params
      this.bridgeFilesList = this.bridgeFilesList.concat(fileList)
    },
    close() {
      this.loading = false
      this.visible = false
      if (this.$refs.inputForm) {
        this.$refs.inputForm.clearValidate()
      }
    },
    doSubmit() {
      const self = this
      this.$refs['inputForm'].validate(async (valid) => {
        if (valid) {
          if (self.inputForm.baseTypeId === EnableSubbridgeTypeId && self.bridgeBranchList.length === 0) {
            self.$message.warning('主桥类型为组合桥时，至少要有一个主辅桥')
            return
          }
          let positionNameId = ''
          if (Array.isArray(self.inputForm.positionName.id) && self.inputForm.positionName.id.length === 3) {
            positionNameId = self.inputForm.positionName.id[2]
          }
          if (typeof self.inputForm.positionName.id === 'string') {
            positionNameId = self.inputForm.positionName.id
          }
          if (!positionNameId) {
            self.$message.warning('区域数据异常，请重新选择')
            return
          }
          // 调用预检查接口
          await self.preSaveCheck()
          self.loading = true
          const params = {
            ...self.inputForm,
            positionName: {id: positionNameId},
            bridgeBranchList: self.bridgeBranchList,
            bridgeFilesList: self.bridgeFilesList,
            bridgePicturesList: self.bridgePicturesList.map((item, index) => ({
              id: item.id,
              imagePath: item.url || item.imagePath,
              imageType: 'jpg',
              sort: item.sort || index
            }))
          }
          self.$http({
            url: '/bridge/bridge/save',
            method: 'POST',
            data: params
          })
            .then(({data}) => {
              self.loading = false
              if (data.success) {
                self.$message.success('保存成功！')
                if (this.$refs.inputForm) {
                  this.$refs.inputForm.resetFields()
                }
                self.visible = false
                self.$emit('refreshDataList')
              } else {
                self.$message.error(data.msg)
              }
            })
            .catch(() => {
              self.loading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.image-wrapper {
  padding: 20px;
}
</style>
