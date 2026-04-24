import { z } from 'zod'

export type SessionPayload = {
  userId: number
  name: string
  email: string
  expiresAt: Date
}

export const RegisterSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }).trim(),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Must be at least 8 characters.' })
    .regex(/[A-Z]/, { message: 'Must contain an uppercase letter.' })
    .regex(/[0-9]/, { message: 'Must contain a number.' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Must contain a special character.' }),
})

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export type FormState =
  | {
      errors?: Record<string, string[]>
      message?: string
    }
  | undefined

export type MoodleUser = {
  id: number
  username: string
  firstname: string
  lastname: string
  fullname: string
  email: string
}

export type MoodleSection = {
  id: number
  name: string
  summary: string
  summaryformat: number
  visible: number
  uservisible: boolean
  availabilityinfo?: string
  modules: MoodleModule[]
}

export type MoodleModule = {
  id: number
  name: string
  modname: string
  modplural: string
  visible: number
  uservisible: boolean
  summary?: string
  summaryformat?: number
  url?: string
  description?: string
  contents?: MoodleContent[]
  dates?: { label: string; timestamp: number }[]
}

export type MoodleContent = {
  type: string
  filename: string
  filepath: string
  filesize: number
  fileurl?: string
  timecreated: number
  timemodified: number
  mimetype?: string
  isexternalfile?: boolean
}

export type MoodleCourse = {
  id: number
  shortname: string
  fullname: string
  summary: string
  summaryformat: number
  categoryid: number
  startdate: number
  enddate: number
  numsections?: number
  overviewfiles?: { fileurl: string; mimetype: string }[]
}
