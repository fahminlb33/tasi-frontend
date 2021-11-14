import createCRUDModule, { client } from 'vuex-crud'

client.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('auth._token.local')
    config.headers = {
      Authorization: token || '',
    }
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

const crudModule = createCRUDModule({
  resource: 'orders',
  urlRoot: process.env.baseUrl + '/api/orders',
  idAttribute: 'orderId',
  parseList(res) {
    const { data } = res.data.data
    return Object.assign({}, res, {
      data, // retrieve array from the json response
    })
  },
  parseSingle(res) {
    const { data } = res.data

    return Object.assign({}, res, {
      data, // expecting object with ID
    })
  },
})
const state = () => crudModule.state

const { actions, mutations, getters } = crudModule

export { state, actions, mutations, getters }
