const router = require('koa-router')()
const { query } = require('../../utils/query')
const { QUERY_TABLE, INSERT_TABLE } = require('../../utils/sql');
const parse = require('../../utils/parse')

router.get('/exercises', async (ctx) => {
  const response = []
  const res = await query(QUERY_TABLE('exercise_list'));
  res.map((item, index) => {
    const { id, exercise_name, exercise_content, is_hot, exercise_difficulty, exercise_type } = item
    response[index] = {
      exerciseId: id,
      exerciseName: exercise_name,
      exerciseContent: exercise_content,
      isHot: is_hot,
      exerciseDifficulty: exercise_difficulty,
      exerciseType: exercise_type
    }
  })
  ctx.response.body = {
    code: 200,
    data: {
      exerciseList: parse(response),
      total: response.length
    }
  };
})

router.get('/exercises/:id', async (ctx) => {
  const id = ctx.params.id
  const res = await query(`SELECT * FROM exercise_detail WHERE exercise_id = ${id}`)
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

router.delete('/exercises/:id', async (ctx) => {
  const id = ctx.params.id
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    await query(`DELETE FROM exercise_list WHERE id = ${id}`)
    responseBody.data.msg = '删除成功'
    responseBody.code = 200
  } catch (e) {
    responseBody.data.msg = '无此课程'
    responseBody.code = 404
  } finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

router.delete('/exercises', async (ctx) => {
  const deleteIdList = ctx.request.body
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    await Promise.all(deleteIdList.map(async (deleteId) => {
      await query(`DELETE FROM exercise_list WHERE id = ${deleteId}`)
    }))
    responseBody.data.msg = '删除成功'
    responseBody.code = 200
  } catch (e) {
    responseBody.data.msg = '无此课程'
    responseBody.code = 404
  } finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

router.post('/exercises', async (ctx) => {
  const {
    exerciseName,
    exerciseContent,
    exerciseType,
    exerciseDifficulty,
    isHot,
    topicList
  } = ctx.request.body
  const responseBody = {
    code: 0,
    data: {}
  }
  try {
    await query(INSERT_TABLE('exercise_list'), {
      exercise_name: exerciseName,
      exercise_content: exerciseContent,
      exercise_type: exerciseType,
      exercise_difficulty: exerciseDifficulty,
      is_hot: isHot,
      topic_list: JSON.stringify(topicList)
    })
    responseBody.data.msg = '新增成功'
    responseBody.code = 200
  } catch (e) {
    responseBody.data.msg = '异常错误'
    responseBody.code = 500
  } finally {
    ctx.response.status = responseBody.code
    ctx.response.body = responseBody
  }
})

module.exports = router