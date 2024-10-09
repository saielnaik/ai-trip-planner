import React from 'react'
import { Button } from '../ui/button'

export default function Header() {
  return (
    <div className='flex lg:flex-row justify-between items-center px-4 lg:px-[10%] py-4'>
    <img src='/logo.svg' className=' lg:w-[40%] w-[100%] mb-4 lg:mb-0' alt="Logo"/>
    <div>
        <Button className="bg-[#FFD43D] px-4 py-2">Support</Button>
    </div>
</div>

  )
}
