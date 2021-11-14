<template>
  <el-form
    ref="ruleForm"
    style="margin-left: 16px; margin-right: 32px"
    :model="ruleForm"
    :rules="rules"
    label-position="left"
    label-width="130px"
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
      <p>Tambah Supplier</p>
      <el-tag type="success" size="small">_</el-tag>
    </div>
    <el-form-item label="Nama Supplier" prop="name">
      <el-input v-model="ruleForm.name"></el-input>
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
      <el-input v-model="ruleForm.latitude" type="text"></el-input>
    </el-form-item>
    <el-form-item label="Longitude" prop="longitude">
      <el-input v-model="ruleForm.longitude" type="text"></el-input>
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
        name: '',
        address: '',
      },
      rules: {
        name: [
          {
            required: true,
            message: 'Silakan masukkan nama pemasok',
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
            message: 'Silakan masukkan alamat',
            trigger: 'blur',
          },
          {
            min: 5,
            max: 200,
            message: 'Panjangnya harus 5 hingga 50',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters('suppliers', {
      products: 'list',
      isLoading: 'isLoading',
    }),
    ...mapState([
      'route', // vuex-router-sync
    ]),
  },
  methods: {
    ...mapActions('suppliers', {
      addProduct: 'create',
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
          this.addProduct({
            data: {
              ...this.ruleForm,
            },
          })
          this.$emit('completed')
        } else {
          this.$message({
            message: 'Error Adding Supplier.',
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
