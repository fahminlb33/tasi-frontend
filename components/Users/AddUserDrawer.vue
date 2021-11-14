<template>
  <el-form
    ref="ruleForm"
    style="margin-left: 16px; margin-right: 32px"
    :model="ruleForm"
    :rules="rules"
    label-width="130px"
    label-position="left"
    class="demo-ruleForm"
  >
    <div
      style="
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.3em;
      "
    >
      <p>Tambah User</p>
      <el-tag type="success" size="small">_</el-tag>
    </div>
    <el-form-item label="Nama pengguna" prop="username">
      <el-input v-model="ruleForm.username"></el-input>
    </el-form-item>
    <el-form-item label="Nama lengkap" prop="fullName">
      <el-input v-model="ruleForm.fullName"></el-input>
    </el-form-item>
    <el-form-item label="Alamat" prop="address">
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
      <el-input
        v-model="ruleForm.latitude"
        type="text"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item label="Longitude" prop="longitude">
      <el-input
        v-model="ruleForm.longitude"
        type="text"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item label="Wewenang" prop="role">
      <el-radio-group v-model="ruleForm.role">
        <el-radio-button label="Supervisor" name="role"></el-radio-button>
        <el-radio-button label="Manager" name="role"></el-radio-button>
        <el-radio-button label="Customer" name="role"></el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="Kata Sandi" prop="password">
      <el-input
        v-model="ruleForm.password"
        placeholder="Silahkan Masukkan Password"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm('ruleForm')"
        >Tambah</el-button
      >
      <el-button @click="resetForm('ruleForm')">Reset</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { mapGetters, mapState, mapActions } from 'vuex'
export default {
  data() {
    return {
      loading: false,
      ruleForm: {
        address: '',
        latitude: '',
        longitude: '',
        fullName: '',
        role: 'Customer',
        userId: 0,
        username: '',
      },
      rules: {
        fullName: [
          {
            required: true,
            message: 'Silakan masukan nama lengkap',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 50,
            message: 'Panjangnya harus 5 hingga 50',
            trigger: 'blur',
          },
        ],
        username: [
          {
            required: true,
            message: 'Silakan masukkan nama pengguna',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 50,
            message: 'Panjangnya harus 5 hingga 50',
            trigger: 'blur',
          },
        ],
        address: [
          {
            required: true,
            message: 'Silakan masukan Alamat',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 200,
            message: 'Panjangnya harus 5 hingga 200',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: 'Silakan masukan Password',
            trigger: 'blur',
          },
          {
            min: 8,
            max: 24,
            message: 'Minimal 8 digit',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters('users', {
      users: 'list',
      isLoading: 'isLoading',
    }),
    ...mapState([
      'route', // vuex-router-sync
    ]),
  },
  methods: {
    ...mapActions('users', {
      addUser: 'create',
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
          this.addUser({ data: this.ruleForm })
          this.$emit('completed')
        } else {
          this.$message({
            message: 'Error Menambahkan User.',
            type: 'warning',
          })
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
  },
}
</script>
