const router = require('koa-router')()
const { query } = require('../../utils/query')
const { QUERY_TABLE } = require('../../utils/sql');
const parse = require('../../utils/parse')

router.get('/exercises', async (ctx) => {
  const response = []
  const res = await query(QUERY_TABLE('exercise_list'));
  res.map((item, index) => {
    const { id, exercise_name, exercise_content, is_hot, difficulty_degree, exercise_type } = item
    response[index] = {
      exerciseId: id,
      exerciseName: exercise_name,
      exerciseContent: exercise_content,
      isHot: is_hot,
      difficultyDegree: difficulty_degree,
      exerciseType: exercise_type
    }
  })
  ctx.response.body = {
    exerciseList: parse(response),
    total: response.length
  };
})

router.get('/exercises/:id', async (ctx) => {
  const id = ctx.params.id
  const res = await query(`SELECT * FROM exercise_detail WHERE exercise_cid = ${id}`)
  const isExist = res.length !== 0
  if (!isExist) {
    ctx.response.status = 404
    ctx.response.body = {
      error: 'exercise is not existed'
    }
  }
  else {
    ctx.response.body = parse(res)[0]
  }
})

module.exports = router