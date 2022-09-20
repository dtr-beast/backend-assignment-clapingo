import { randEmail, randFullName, randPassword } from "@ngneat/falso"
import axios from "axios"
import { util } from "zod/lib/helpers/util"

const PORT = 3000

interface Data {
  id: string
  token: string
  name: string
}

const learnerRegister = axios.create({
  baseURL: `http://localhost:${PORT}/api/auth/signup`,
})

const teacherRegister = axios.create({
  baseURL: `http://localhost:${PORT}/api/auth/signup?teacher=true`,
})

const addTeacher = axios.create({
  baseURL: `http://localhost:${PORT}/api/teachers/add`,
})

async function createTeacher() {
  const email = randEmail()
  const password = randPassword()
  const name = randFullName()

  const { data } = await teacherRegister.post("", {
    email,
    password,
    name,
  })

  return { id: data.teacherId, token: data.token, name: data.name }
}
async function createLearner() {
  const email = randEmail()
  const password = randPassword()
  const name = randFullName()

  const { data } = await learnerRegister.post("", {
    email,
    password,
    name,
  })

  return { id: data.id, token: data.token, name: data.name }
}

async function createMockData() {
  const teacherArr: Data[] = []
  const learnerArr: Data[] = []

  // Create 3 teachers
  for (let i = 0; i < 3; i++) {
    const { id, token, name } = await createTeacher()
    teacherArr.push({ id, token, name })
  }

  // Create 10 learners
  for (let i = 0; i < 10; i++) {
    const { id, token, name } = await createLearner()
    learnerArr.push({ id, token, name })
  }

  // Add 1st teacher to all learners favurite
  for (let i = 0; i < learnerArr.length; i++) {
    const { token: learnerToken } = learnerArr[i]
    const { id: teacherId } = teacherArr[0]

    await addTeacher.post(
      teacherId,
      {},
      {
        headers: {
          Authorization: `Bearer ${learnerToken}`,
        },
      }
    )
  }

  // Add 2nd teacher to first 5 learners favurite
  for (let i = 0; i < 5; i++) {
    const { token: learnerToken } = learnerArr[i]
    const { id: teacherId } = teacherArr[1]

    await addTeacher.post(
      teacherId,
      {},
      {
        headers: {
          Authorization: `Bearer ${learnerToken}`,
        },
      }
    )
  }

  // Add 3rd teacher to first 3 learners favurite
  for (let i = 0; i < 3; i++) {
    const { token: learnerToken } = learnerArr[i]
    const { id: teacherId } = teacherArr[2]

    await addTeacher.post(
      teacherId,
      {},
      {
        headers: {
          Authorization: `Bearer ${learnerToken}`,
        },
      }
    )
  }
  console.log(`Teacher 1: ${teacherArr[0].name} - ${teacherArr[0].id}`)
  console.log(`Teacher 2: ${teacherArr[1].name} - ${teacherArr[1].id}`)
  console.log(`Teacher 3: ${teacherArr[2].name} - ${teacherArr[2].id}`)

}

createMockData()
