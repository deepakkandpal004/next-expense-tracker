import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import Guest from '../components/Guest'

const page = async () => {
  const user = await currentUser();

  if(!user) {
    return (
      <Guest />
    )
  }
  return (
    <div className='text-red-500 dark:text-red-300'>
      <h1>Home Page</h1>
    </div>
  )
}

export default page