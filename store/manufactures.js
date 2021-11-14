import createCRUDModule, { client } from 'vuex-crud'

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth._token.local')
    config.headers = {
      Authorization: token || '',
    }
    return config
  },
  (error) => Promise.reject(error)
)

const crudModule = createCRUDModule({
  resource: 'manufactures',
  urlRoot: process.env.baseUrl + '/api/manufacture',
  idAttribute: 'manufactureId',
  parseList(res) {
    const { data } = res.data.data
    return Object.assign({}, res, {
      data,
    })
  },
  parseSingle(res) {
    const { data } = res.data

    return Object.assign({}, res, {
      data,
    })
  },
})
const state = () => crudModule.state

const { actions, mutations, getters } = crudModule

export { state, actions, mutations, getters }
