

export default (token) => ({
  headers: {
    Authorization: `bearer ${token}`,
    ...strapiHeader(),
  },
})


export const strapiHeader = () => {
  return {
    'Strapi-Response-Format': 'v4'
  }
}