<template>
  <div class="login-container">
    <el-image class="login-bg" src="https://bridge-product.oss-cn-beijing.aliyuncs.com/login-bg.png" fit="cover"></el-image>
    <div class="login-wrapper">
      <div class="login-main">
        <div class="header">
          <div class="line"></div>
          <div class="header-title">用户登录</div>
        </div>
        <el-form ref="inputForm" :model="inputForm" :rules="rules" class="login-form"  @keyup.enter.native="login()" @submit.native.prevent>
          <el-form-item  prop="username">
            <el-input type="text" class="login-user" placeholder="请输入账号/手机号" v-model="inputForm.username" prefix-icon="el-icon-user">
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" class="login-pwd" show-password placeholder="请输入密码" v-model="inputForm.password" prefix-icon="el-icon-key">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" class="login-submit" @click="login">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        time: '',
        logo: '',
        productName: '',
        loading: false,
        inputForm: {
          username: '',
          password: '',
          uuid: '',
          captcha: ''
        },
        rules: {
          username: [
            {required: true, message: '帐号不能为空', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '密码不能为空', trigger: 'blur'}
          ],
          captcha: [
            {required: true, message: '验证码不能为空', trigger: 'blur'}
          ]
        },
        captchaPath: ''
      }
    },
    created () {
      this.getTime()
      setInterval(() => {
        this.getTime()
      }, 1000)
    },
    mounted () {
      this.$http.get('/sys/sysConfig/getConfig').then(({data}) => {
        // this.logo = data.config.logo
        this.productName = data.config.productName
      })
    },
    methods: {
      // 提交表单
      login () {
        if (!this.inputForm.username) {
          this.$message.error('帐号不能为空')
          return
        }
        if (!this.inputForm.password) {
          this.$message.error('密码不能为空')
          return
        }
        this.$refs['inputForm'].validate((valid) => {
          if (valid) {
            this.loading = true
            this.$http({
              url: '/sys/login',
              method: 'post',
              data: {
                'userName': this.inputForm.username,
                'password': this.inputForm.password
              }
            }).then(({data}) => {
              if (data && data.success) {
                this.$cookie.set('token', data.token)
                this.$cookie.set('refreshToken', data.refreshToken)
                this.$router.push({name: 'home'})
              } else {
                this.loading = false
                // this.getCaptcha()
              }
            })
          }
        })
      },
      getTime () {
        this.time = this.moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      },
      // 获取验证码
      getCaptcha () {
        this.captchaPath = this.$http.BASE_URL + `/captcha.jpg`
      }
    }
  }
</script>
<style type="text/scss" lang="scss" scoped>
@import '~@/assets/scss/login.scss';
</style>
