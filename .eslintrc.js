module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    'node': true,
    'es6': true
  },
  extends: 'standard',
  plugins: ['import'],
  'rules' : {
    //disallow semis
    'semi': 0,
    //allow paren-less arrow function
    'arrow-parens': 0,
    //allow async-await
    'generator-star-spacing': 0,
    //allow unused vars
    'no-unused-vars': 0,
    'one-var': 0
  }
}
