<template>
  <el-form
    v-if="currentUsers"
    ref="ruleForm"
    style="margin-left: 16px; margin-right: 32px"
    :model="ruleForm"
    :rules="rules"
    label-position="left"
    label-width="130px"
  >
    <div
      style="
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.3em;
      "
    >
      <p>Sunting User</p>
      <el-tag size="small">{{ id }}</el-tag>
    </div>
    <el-form-item label="User name" prop="username">
      <el-input v-model="ruleForm.username"></el-input>
    </el-form-item>
    <el-form-item label="Full name" prop="fullName">
      <el-input v-model="ruleForm.fullName"></el-input>
    </el-form-item>
    <el-form-item label="Address" prop="address">
      <el-input v-model="ruleForm.address" type="textarea"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button
        type="default"
        size="medium"
        icon="el-icon-location-outline"
        :disabled="ruleForm.address === ''"
        @click="lookup()"
        >Cari</el-button
      >
    </el-form-item>
    <el-form-item label="Latitude" prop="latitude">
      <el-input v-model="ruleForm.latitude" type="text"></el-input>
    </el-form-item>
    <el-form-item label="Longitude" prop="longitude">
      <el-input v-model="ruleForm.longitude" type="text"></el-input>
    </el-form-item>
    <el-form-item label="Role" prop="role">
      <el-radio-group v-model="ruleForm.role">
        <el-radio-button label="Supervisor" name="role"></el-radio-button>
        <el-radio-button label="Manager" name="role"></el-radio-button>
        <el-radio-button label="Customer" name="role"></el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm('ruleForm')"
        >Perbarui</el-button
      >
    </el-form-item>
  </el-form>
</template>
<script>
import { mapGetters, mapState, mapActions } from 'vuex'
export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      ruleForm: {
        address: '',
        fullName: '',
        role: '',
        userId: 0,
        username: '',
      },
      rules: {
        fullName: [
          {
            required: true,
            message: 'Please input Full Name',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 50,
            message: 'Length should be 5 to 50',
            trigger: 'blur',
          },
        ],
        username: [
          {
            required: true,
            message: 'Please input Username',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 50,
            message: 'Length should be 5 to 50',
            trigger: 'blur',
          },
        ],
        address: [
          {
            required: true,
            message: 'Please input Address',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 200,
            message: 'Length should be 5 to 200',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters('users', {
      userById: 'byId',
      isLoading: 'isLoading',
    }),
    ...mapState([
      'route', // vuex-router-sync
    ]),

    currentUsers() {
      return this.userById(this.id)
    },
  },
  watch: {
    $route: 'fetchData',
  },

  created() {
    this.fetchData()
    Object.assign(this.ruleForm, this.currentUsers)
  },
  methods: {
    ...mapActions('users', {
      updateUsers: 'replace',
      fetchUsers: 'fetchSingle',
    }),
    async GetLocationAsync() {
      const location = await this.$axios.$get(
        process.env.baseUrl + '/api/maps/lookup',
        { params: { address: this.ruleForm.address } }
      )

      return location.data
    },
    async lookup() {
      const location = await this.GetLocationAsync()
      if (location) {
        this.$message({
          message: 'Lokasi Ditemukan, memperbarui data',
          type: 'success',
        })
        this.ruleForm.address = location.geocodedAddress
        this.ruleForm.latitude = location.latitude
        this.ruleForm.longitude = location.longitude
      } else {
        this.$message({
          message: 'Error Mencari Lokasi.',
          type: 'warning',
        })
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.updateUsers({ id: this.id, data: this.ruleForm })
          this.$message({
            message: 'Informasi Pengguna berhasil diperbarui.',
            type: 'success',
          })
          this.$emit('completed')
          return true
        } else {
          this.$message({
            message: 'Terjadi kesalahan saat memperbarui User.',
            type: 'warning',
          })
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },

    fetchData() {
      const data = this.fetchUsers({
        id: this.id,
      })
      return data
    },
  },
}
</script>
